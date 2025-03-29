const Bull = require('bull');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');
const { getConfig } = require('./configUtils');
const { sendEmail, getEmailStatus } = require('./rusenderUtils');

// Создаем очереди
const emailQueue = new Bull('email', config.redis);
const campaignQueue = new Bull('campaign', config.redis);
const analyticsQueue = new Bull('analytics', config.redis);

// Получение событий очереди
const getQueueEvents = (queueName) => {
    const queue = getQueue(queueName);
    if (!queue) {
        throw new Error(`Очередь ${queueName} не найдена`);
    }

    return {
        getActiveCount: async () => {
            try {
                return await queue.getActiveCount();
            } catch (error) {
                logError(`Ошибка получения количества активных задач в очереди ${queueName}:`, error);
                return 0;
            }
        },
        getWaitingCount: async () => {
            try {
                return await queue.getWaitingCount();
            } catch (error) {
                logError(`Ошибка получения количества ожидающих задач в очереди ${queueName}:`, error);
                return 0;
            }
        },
        getCompletedCount: async () => {
            try {
                return await queue.getCompletedCount();
            } catch (error) {
                logError(`Ошибка получения количества завершенных задач в очереди ${queueName}:`, error);
                return 0;
            }
        },
        getFailedCount: async () => {
            try {
                return await queue.getFailedCount();
            } catch (error) {
                logError(`Ошибка получения количества неудачных задач в очереди ${queueName}:`, error);
                return 0;
            }
        },
        getDelayedCount: async () => {
            try {
                return await queue.getDelayedCount();
            } catch (error) {
                logError(`Ошибка получения количества отложенных задач в очереди ${queueName}:`, error);
                return 0;
            }
        },
        getAverageProcessingTime: async () => {
            try {
                const jobs = await queue.getJobs(['completed'], 0, 100);
                if (jobs.length === 0) return 0;

                const totalTime = jobs.reduce((sum, job) => {
                    return sum + (job.finishedOn - job.processedOn);
                }, 0);

                return totalTime / jobs.length;
            } catch (error) {
                logError(`Ошибка получения среднего времени обработки задач в очереди ${queueName}:`, error);
                return 0;
            }
        },
        getThroughput: async () => {
            try {
                const completedCount = await queue.getCompletedCount();
                const failedCount = await queue.getFailedCount();
                const timeWindow = 60 * 1000; // 1 минута

                return (completedCount + failedCount) / (timeWindow / 1000);
            } catch (error) {
                logError(`Ошибка получения пропускной способности очереди ${queueName}:`, error);
                return 0;
            }
        }
    };
};

// Получение очереди по имени
const getQueue = (queueName) => {
    switch (queueName) {
        case 'email':
            return emailQueue;
        case 'campaign':
            return campaignQueue;
        case 'analytics':
            return analyticsQueue;
        default:
            return null;
    }
};

// Добавление задачи в очередь
const addJob = async (queueName, data, options = {}) => {
    try {
        const queue = getQueue(queueName);
        if (!queue) {
            throw new Error(`Очередь ${queueName} не найдена`);
        }

        const job = await queue.add(data, options);
        logInfo(`Задача добавлена в очередь ${queueName}:`, {
            jobId: job.id,
            data
        });

        return job;
    } catch (error) {
        logError(`Ошибка добавления задачи в очередь ${queueName}:`, error);
        throw error;
    }
};

// Получение задачи из очереди
const getJob = async (queueName, jobId) => {
    try {
        const queue = getQueue(queueName);
        if (!queue) {
            throw new Error(`Очередь ${queueName} не найдена`);
        }

        const job = await queue.getJob(jobId);
        if (!job) {
            throw new Error(`Задача ${jobId} не найдена в очереди ${queueName}`);
        }

        return job;
    } catch (error) {
        logError(`Ошибка получения задачи из очереди ${queueName}:`, error);
        throw error;
    }
};

// Удаление задачи из очереди
const removeJob = async (queueName, jobId) => {
    try {
        const queue = getQueue(queueName);
        if (!queue) {
            throw new Error(`Очередь ${queueName} не найдена`);
        }

        const job = await getJob(queueName, jobId);
        await job.remove();

        logInfo(`Задача удалена из очереди ${queueName}:`, {
            jobId
        });
    } catch (error) {
        logError(`Ошибка удаления задачи из очереди ${queueName}:`, error);
        throw error;
    }
};

// Очистка очереди
const cleanQueue = async (queueName, grace = 1000) => {
    try {
        const queue = getQueue(queueName);
        if (!queue) {
            throw new Error(`Очередь ${queueName} не найдена`);
        }

        await queue.clean(grace, 'completed');
        await queue.clean(grace, 'failed');
        await queue.clean(grace, 'delayed');

        logInfo(`Очередь ${queueName} очищена`);
    } catch (error) {
        logError(`Ошибка очистки очереди ${queueName}:`, error);
        throw error;
    }
};

// Получение статистики очереди
const getQueueStats = async (queueName) => {
    try {
        const queue = getQueue(queueName);
        if (!queue) {
            throw new Error(`Очередь ${queueName} не найдена`);
        }

        const stats = {
            active: await queue.getActiveCount(),
            waiting: await queue.getWaitingCount(),
            completed: await queue.getCompletedCount(),
            failed: await queue.getFailedCount(),
            delayed: await queue.getDelayedCount(),
            averageProcessingTime: await getQueueEvents(queueName).getAverageProcessingTime(),
            throughput: await getQueueEvents(queueName).getThroughput()
        };

        logInfo(`Получена статистика очереди ${queueName}:`, stats);
        return stats;
    } catch (error) {
        logError(`Ошибка получения статистики очереди ${queueName}:`, error);
        throw error;
    }
};

// Инициализация обработчиков событий очереди
const initializeQueueEvents = () => {
    const queues = [emailQueue, campaignQueue, analyticsQueue];

    queues.forEach(queue => {
        queue.on('error', error => {
            logError(`Ошибка в очереди ${queue.name}:`, error);
        });

        queue.on('waiting', jobId => {
            logInfo(`Задача ${jobId} ожидает обработки в очереди ${queue.name}`);
        });

        queue.on('active', job => {
            logInfo(`Задача ${job.id} начала обработку в очереди ${queue.name}`);
        });

        queue.on('completed', job => {
            logInfo(`Задача ${job.id} успешно завершена в очереди ${queue.name}`);
        });

        queue.on('failed', (job, error) => {
            logError(`Задача ${job.id} завершилась с ошибкой в очереди ${queue.name}:`, error);
        });

        queue.on('stalled', job => {
            logError(`Задача ${job.id} застряла в очереди ${queue.name}`);
        });
    });
};

const processEmailQueue = async () => {
    emailQueue.process(async (job) => {
        try {
            const result = await sendEmail(job.data);
            logInfo(`Письмо успешно отправлено: ${job.id}`);
            return result;
        } catch (error) {
            logError(`Ошибка при обработке задачи ${job.id}:`, error);
            throw error;
        }
    });
};

const getQueueStatus = async () => {
    try {
        const [waiting, active, completed, failed] = await Promise.all([
            emailQueue.getWaitingCount(),
            emailQueue.getActiveCount(),
            emailQueue.getCompletedCount(),
            emailQueue.getFailedCount()
        ]);

        return {
            waiting,
            active,
            completed,
            failed
        };
    } catch (error) {
        logError('Ошибка при получении статуса очереди:', error);
        throw error;
    }
};

const retryJob = async (jobId) => {
    try {
        const job = await getJob('email', jobId);
        await job.retry();
        logInfo(`Задача ${jobId} добавлена на повторную обработку`);
    } catch (error) {
        logError(`Ошибка при повторной обработке задачи ${jobId}:`, error);
        throw error;
    }
};

const getJobLogs = async (jobId) => {
    try {
        const job = await getJob('email', jobId);
        return await job.logs();
    } catch (error) {
        logError(`Ошибка при получении логов задачи ${jobId}:`, error);
        throw error;
    }
};

const pauseQueue = async () => {
    try {
        await emailQueue.pause();
        logInfo('Очередь приостановлена');
    } catch (error) {
        logError('Ошибка при приостановке очереди:', error);
        throw error;
    }
};

const resumeQueue = async () => {
    try {
        await emailQueue.resume();
        logInfo('Очередь возобновлена');
    } catch (error) {
        logError('Ошибка при возобновлении очереди:', error);
        throw error;
    }
};

module.exports = {
    getQueueEvents,
    addJob,
    getJob,
    removeJob,
    cleanQueue,
    getQueueStats,
    initializeQueueEvents,
    processEmailQueue,
    getQueueStatus,
    retryJob,
    getJobLogs,
    pauseQueue,
    resumeQueue
}; 
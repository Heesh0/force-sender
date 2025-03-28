const Bull = require('bull');
const { getConfig } = require('./configUtils');
const logger = require('./logger');
const { sendEmail, getEmailStatus } = require('./rusenderUtils');

const emailQueue = new Bull('email-queue', {
    redis: {
        host: getConfig('redis.host'),
        port: getConfig('redis.port'),
        password: getConfig('redis.password')
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
});

const addEmailJob = async (data) => {
    try {
        const job = await emailQueue.add(data);
        logger.info(`Добавлена задача отправки письма: ${job.id}`);
        return job;
    } catch (error) {
        logger.error('Ошибка при добавлении задачи в очередь:', error);
        throw error;
    }
};

const processEmailQueue = async () => {
    emailQueue.process(async (job) => {
        try {
            const result = await sendEmail(job.data);
            logger.info(`Письмо успешно отправлено: ${job.id}`);
            return result;
        } catch (error) {
            logger.error(`Ошибка при обработке задачи ${job.id}:`, error);
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
        logger.error('Ошибка при получении статуса очереди:', error);
        throw error;
    }
};

const cleanQueue = async (completedDays = 7, failedDays = 30) => {
    try {
        const now = Date.now();
        const completedBefore = now - (completedDays * 24 * 60 * 60 * 1000);
        const failedBefore = now - (failedDays * 24 * 60 * 60 * 1000);

        await Promise.all([
            emailQueue.clean(completedDays * 24 * 60 * 60 * 1000, 'completed'),
            emailQueue.clean(failedDays * 24 * 60 * 60 * 1000, 'failed')
        ]);

        logger.info(`Очередь очищена: удалены задачи старше ${completedDays} дней (выполненные) и ${failedDays} дней (неудачные)`);
    } catch (error) {
        logger.error('Ошибка при очистке очереди:', error);
        throw error;
    }
};

const getJob = async (jobId) => {
    try {
        const job = await emailQueue.getJob(jobId);
        if (!job) {
            throw new Error(`Задача ${jobId} не найдена`);
        }
        return job;
    } catch (error) {
        logger.error(`Ошибка при получении задачи ${jobId}:`, error);
        throw error;
    }
};

const removeJob = async (jobId) => {
    try {
        const job = await getJob(jobId);
        await job.remove();
        logger.info(`Задача ${jobId} удалена из очереди`);
    } catch (error) {
        logger.error(`Ошибка при удалении задачи ${jobId}:`, error);
        throw error;
    }
};

const retryJob = async (jobId) => {
    try {
        const job = await getJob(jobId);
        await job.retry();
        logger.info(`Задача ${jobId} добавлена на повторную обработку`);
    } catch (error) {
        logger.error(`Ошибка при повторной обработке задачи ${jobId}:`, error);
        throw error;
    }
};

const getJobLogs = async (jobId) => {
    try {
        const job = await getJob(jobId);
        return await job.logs();
    } catch (error) {
        logger.error(`Ошибка при получении логов задачи ${jobId}:`, error);
        throw error;
    }
};

const pauseQueue = async () => {
    try {
        await emailQueue.pause();
        logger.info('Очередь приостановлена');
    } catch (error) {
        logger.error('Ошибка при приостановке очереди:', error);
        throw error;
    }
};

const resumeQueue = async () => {
    try {
        await emailQueue.resume();
        logger.info('Очередь возобновлена');
    } catch (error) {
        logger.error('Ошибка при возобновлении очереди:', error);
        throw error;
    }
};

const getQueueEvents = () => {
    emailQueue.on('completed', (job) => {
        logger.info(`Задача ${job.id} успешно выполнена`);
    });

    emailQueue.on('failed', (job, error) => {
        logger.error(`Задача ${job.id} завершилась с ошибкой:`, error);
    });

    emailQueue.on('stalled', (job) => {
        logger.warn(`Задача ${job.id} зависла`);
    });

    emailQueue.on('active', (job) => {
        logger.info(`Задача ${job.id} начала обработку`);
    });

    emailQueue.on('waiting', (jobId) => {
        logger.info(`Задача ${jobId} ожидает обработки`);
    });
};

module.exports = {
    emailQueue,
    addEmailJob,
    processEmailQueue,
    getQueueStatus,
    cleanQueue,
    getJob,
    removeJob,
    retryJob,
    getJobLogs,
    pauseQueue,
    resumeQueue,
    getQueueEvents
}; 
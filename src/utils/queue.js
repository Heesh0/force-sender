const { logger } = require('./logger');

class Queue {
    constructor(options = {}) {
        this.queue = [];
        this.processing = false;
        this.options = {
            maxSize: options.maxSize || 1000,
            maxConcurrent: options.maxConcurrent || 1,
            retryDelay: options.retryDelay || 1000,
            maxRetries: options.maxRetries || 3
        };
        this.concurrentTasks = 0;
    }

    // Добавление задачи в очередь
    async add(task, options = {}) {
        try {
            if (this.queue.length >= this.options.maxSize) {
                throw new Error('Очередь переполнена');
            }

            const taskWithOptions = {
                task,
                options: {
                    retries: 0,
                    ...options
                }
            };

            this.queue.push(taskWithOptions);
            
            logger.info('Задача добавлена в очередь:', {
                queueSize: this.queue.length,
                options
            });

            if (!this.processing) {
                this.process();
            }

            return true;
        } catch (error) {
            logger.error('Ошибка добавления задачи в очередь:', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    // Обработка очереди
    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        try {
            while (this.queue.length > 0 && this.concurrentTasks < this.options.maxConcurrent) {
                const taskWithOptions = this.queue.shift();
                this.concurrentTasks++;

                this.executeTask(taskWithOptions)
                    .catch(error => {
                        logger.error('Ошибка выполнения задачи:', {
                            error: error.message,
                            retries: taskWithOptions.options.retries
                        });

                        if (taskWithOptions.options.retries < this.options.maxRetries) {
                            taskWithOptions.options.retries++;
                            this.queue.push(taskWithOptions);
                            
                            logger.info('Задача возвращена в очередь:', {
                                retries: taskWithOptions.options.retries
                            });
                        }
                    })
                    .finally(() => {
                        this.concurrentTasks--;
                        if (this.queue.length > 0) {
                            this.process();
                        } else {
                            this.processing = false;
                        }
                    });
            }
        } catch (error) {
            logger.error('Ошибка обработки очереди:', {
                error: error.message
            });
            this.processing = false;
        }
    }

    // Выполнение задачи
    async executeTask(taskWithOptions) {
        try {
            const result = await taskWithOptions.task();
            
            logger.info('Задача выполнена успешно:', {
                retries: taskWithOptions.options.retries
            });

            return result;
        } catch (error) {
            if (taskWithOptions.options.retries < this.options.maxRetries) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.options.retryDelay)
                );
            }
            throw error;
        }
    }

    // Получение размера очереди
    getSize() {
        return this.queue.length;
    }

    // Получение количества выполняющихся задач
    getConcurrentTasks() {
        return this.concurrentTasks;
    }

    // Очистка очереди
    clear() {
        this.queue = [];
        this.processing = false;
        this.concurrentTasks = 0;

        logger.info('Очередь очищена');
    }

    // Получение статистики
    getStats() {
        return {
            queueSize: this.queue.length,
            concurrentTasks: this.concurrentTasks,
            isProcessing: this.processing
        };
    }
}

// Функция для создания очереди с приоритетами
class PriorityQueue extends Queue {
    constructor(options = {}) {
        super(options);
        this.priorities = new Map();
    }

    // Добавление задачи с приоритетом
    async add(task, priority = 0, options = {}) {
        try {
            if (this.queue.length >= this.options.maxSize) {
                throw new Error('Очередь переполнена');
            }

            const taskWithOptions = {
                task,
                priority,
                options: {
                    retries: 0,
                    ...options
                }
            };

            this.queue.push(taskWithOptions);
            this.queue.sort((a, b) => b.priority - a.priority);
            
            logger.info('Задача добавлена в очередь с приоритетом:', {
                queueSize: this.queue.length,
                priority,
                options
            });

            if (!this.processing) {
                this.process();
            }

            return true;
        } catch (error) {
            logger.error('Ошибка добавления задачи в очередь с приоритетом:', {
                error: error.message,
                priority,
                options
            });
            throw error;
        }
    }

    // Получение статистики с приоритетами
    getStats() {
        const stats = super.getStats();
        const priorities = new Map();

        for (const task of this.queue) {
            const count = priorities.get(task.priority) || 0;
            priorities.set(task.priority, count + 1);
        }

        return {
            ...stats,
            priorities: Object.fromEntries(priorities)
        };
    }
}

// Функция для создания очереди с задержкой
class DelayedQueue extends Queue {
    constructor(options = {}) {
        super(options);
        this.delays = new Map();
    }

    // Добавление задачи с задержкой
    async add(task, delay = 0, options = {}) {
        try {
            if (this.queue.length >= this.options.maxSize) {
                throw new Error('Очередь переполнена');
            }

            const taskWithOptions = {
                task,
                delay,
                options: {
                    retries: 0,
                    ...options
                }
            };

            if (delay > 0) {
                setTimeout(() => {
                    this.queue.push(taskWithOptions);
                    
                    logger.info('Задержанная задача добавлена в очередь:', {
                        queueSize: this.queue.length,
                        delay,
                        options
                    });

                    if (!this.processing) {
                        this.process();
                    }
                }, delay);
            } else {
                this.queue.push(taskWithOptions);
                
                logger.info('Задача добавлена в очередь:', {
                    queueSize: this.queue.length,
                    options
                });

                if (!this.processing) {
                    this.process();
                }
            }

            return true;
        } catch (error) {
            logger.error('Ошибка добавления задачи в очередь с задержкой:', {
                error: error.message,
                delay,
                options
            });
            throw error;
        }
    }

    // Получение статистики с задержками
    getStats() {
        const stats = super.getStats();
        const delays = new Map();

        for (const task of this.queue) {
            const count = delays.get(task.delay) || 0;
            delays.set(task.delay, count + 1);
        }

        return {
            ...stats,
            delays: Object.fromEntries(delays)
        };
    }
}

module.exports = {
    Queue,
    PriorityQueue,
    DelayedQueue
}; 
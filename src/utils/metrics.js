const { redis } = require('./redis');
const { logger } = require('./logger');

// Функция для увеличения счетчика
const incrementCounter = async (key, value = 1) => {
    try {
        const result = await redis.incrby(key, value);
        logger.info('Счетчик увеличен:', {
            key,
            value,
            result
        });
        return result;
    } catch (error) {
        logger.error('Ошибка увеличения счетчика:', error);
        throw error;
    }
};

// Функция для уменьшения счетчика
const decrementCounter = async (key, value = 1) => {
    try {
        const result = await redis.decrby(key, value);
        logger.info('Счетчик уменьшен:', {
            key,
            value,
            result
        });
        return result;
    } catch (error) {
        logger.error('Ошибка уменьшения счетчика:', error);
        throw error;
    }
};

// Функция для получения значения счетчика
const getCounter = async (key) => {
    try {
        const value = await redis.get(key);
        return value ? parseInt(value, 10) : 0;
    } catch (error) {
        logger.error('Ошибка получения значения счетчика:', error);
        throw error;
    }
};

// Функция для добавления значения в множество
const addToSet = async (key, value) => {
    try {
        const result = await redis.sadd(key, value);
        logger.info('Значение добавлено в множество:', {
            key,
            value,
            result
        });
        return result;
    } catch (error) {
        logger.error('Ошибка добавления значения в множество:', error);
        throw error;
    }
};

// Функция для удаления значения из множества
const removeFromSet = async (key, value) => {
    try {
        const result = await redis.srem(key, value);
        logger.info('Значение удалено из множества:', {
            key,
            value,
            result
        });
        return result;
    } catch (error) {
        logger.error('Ошибка удаления значения из множества:', error);
        throw error;
    }
};

// Функция для получения размера множества
const getSetSize = async (key) => {
    try {
        return await redis.scard(key);
    } catch (error) {
        logger.error('Ошибка получения размера множества:', error);
        throw error;
    }
};

// Функция для добавления значения в отсортированное множество
const addToSortedSet = async (key, value, score) => {
    try {
        const result = await redis.zadd(key, score, value);
        logger.info('Значение добавлено в отсортированное множество:', {
            key,
            value,
            score,
            result
        });
        return result;
    } catch (error) {
        logger.error('Ошибка добавления значения в отсортированное множество:', error);
        throw error;
    }
};

// Функция для получения значений из отсортированного множества
const getFromSortedSet = async (key, start = 0, end = -1) => {
    try {
        return await redis.zrange(key, start, end);
    } catch (error) {
        logger.error('Ошибка получения значений из отсортированного множества:', error);
        throw error;
    }
};

// Функция для получения значений и их баллов из отсортированного множества
const getFromSortedSetWithScores = async (key, start = 0, end = -1) => {
    try {
        return await redis.zrange(key, start, end, 'WITHSCORES');
    } catch (error) {
        logger.error('Ошибка получения значений и баллов из отсортированного множества:', error);
        throw error;
    }
};

// Функция для добавления значения в список
const addToList = async (key, value) => {
    try {
        const result = await redis.rpush(key, value);
        logger.info('Значение добавлено в список:', {
            key,
            value,
            result
        });
        return result;
    } catch (error) {
        logger.error('Ошибка добавления значения в список:', error);
        throw error;
    }
};

// Функция для получения значений из списка
const getFromList = async (key, start = 0, end = -1) => {
    try {
        return await redis.lrange(key, start, end);
    } catch (error) {
        logger.error('Ошибка получения значений из списка:', error);
        throw error;
    }
};

// Функция для получения размера списка
const getListSize = async (key) => {
    try {
        return await redis.llen(key);
    } catch (error) {
        logger.error('Ошибка получения размера списка:', error);
        throw error;
    }
};

// Функция для очистки метрик
const clearMetrics = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            logger.info('Метрики очищены:', {
                pattern,
                count: keys.length
            });
        }
        return keys.length;
    } catch (error) {
        logger.error('Ошибка очистки метрик:', error);
        throw error;
    }
};

// Функция для получения статистики по метрикам
const getMetricsStats = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        const stats = {};

        for (const key of keys) {
            const type = await redis.type(key);
            let value;

            switch (type) {
                case 'string':
                    value = await redis.get(key);
                    break;
                case 'set':
                    value = await redis.scard(key);
                    break;
                case 'zset':
                    value = await redis.zcard(key);
                    break;
                case 'list':
                    value = await redis.llen(key);
                    break;
                default:
                    value = null;
            }

            stats[key] = {
                type,
                value
            };
        }

        return stats;
    } catch (error) {
        logger.error('Ошибка получения статистики метрик:', error);
        throw error;
    }
};

module.exports = {
    incrementCounter,
    decrementCounter,
    getCounter,
    addToSet,
    removeFromSet,
    getSetSize,
    addToSortedSet,
    getFromSortedSet,
    getFromSortedSetWithScores,
    addToList,
    getFromList,
    getListSize,
    clearMetrics,
    getMetricsStats
}; 
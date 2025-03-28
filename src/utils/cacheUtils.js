const Redis = require('ioredis');
const { getConfig } = require('./configUtils');
const logger = require('./logger');

const redis = new Redis({
    host: getConfig('redis.host'),
    port: getConfig('redis.port'),
    password: getConfig('redis.password'),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('error', (error) => {
    logger.error('Ошибка подключения к Redis:', error);
});

redis.on('connect', () => {
    logger.info('Успешное подключение к Redis');
});

const setCache = async (key, value, ttl = 3600) => {
    try {
        const serializedValue = JSON.stringify(value);
        await redis.set(key, serializedValue, 'EX', ttl);
        logger.debug(`Установлено кэширование для ключа: ${key}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при установке кэша для ключа ${key}:`, error);
        return false;
    }
};

const getCache = async (key) => {
    try {
        const value = await redis.get(key);
        if (value) {
            logger.debug(`Кэш найден для ключа: ${key}`);
            return JSON.parse(value);
        }
        logger.debug(`Кэш не найден для ключа: ${key}`);
        return null;
    } catch (error) {
        logger.error(`Ошибка при получении кэша для ключа ${key}:`, error);
        return null;
    }
};

const deleteCache = async (key) => {
    try {
        await redis.del(key);
        logger.debug(`Удален кэш для ключа: ${key}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при удалении кэша для ключа ${key}:`, error);
        return false;
    }
};

const clearCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            logger.debug(`Очищен кэш для паттерна: ${pattern}`);
        }
        return true;
    } catch (error) {
        logger.error(`Ошибка при очистке кэша для паттерна ${pattern}:`, error);
        return false;
    }
};

const setHashCache = async (key, field, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        await redis.hset(key, field, serializedValue);
        logger.debug(`Установлено хэш-кэширование для ключа: ${key}, поле: ${field}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при установке хэш-кэша для ключа ${key}, поле ${field}:`, error);
        return false;
    }
};

const getHashCache = async (key, field) => {
    try {
        const value = await redis.hget(key, field);
        if (value) {
            logger.debug(`Хэш-кэш найден для ключа: ${key}, поле: ${field}`);
            return JSON.parse(value);
        }
        logger.debug(`Хэш-кэш не найден для ключа: ${key}, поле: ${field}`);
        return null;
    } catch (error) {
        logger.error(`Ошибка при получении хэш-кэша для ключа ${key}, поле ${field}:`, error);
        return null;
    }
};

const deleteHashCache = async (key, field) => {
    try {
        await redis.hdel(key, field);
        logger.debug(`Удален хэш-кэш для ключа: ${key}, поле: ${field}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при удалении хэш-кэша для ключа ${key}, поле ${field}:`, error);
        return false;
    }
};

const getHashAllCache = async (key) => {
    try {
        const values = await redis.hgetall(key);
        const result = {};
        for (const [field, value] of Object.entries(values)) {
            result[field] = JSON.parse(value);
        }
        return result;
    } catch (error) {
        logger.error(`Ошибка при получении всего хэш-кэша для ключа ${key}:`, error);
        return null;
    }
};

module.exports = {
    redis,
    setCache,
    getCache,
    deleteCache,
    clearCache,
    setHashCache,
    getHashCache,
    deleteHashCache,
    getHashAllCache
}; 
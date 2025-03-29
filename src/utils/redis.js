const Redis = require('ioredis');
const config = require('../config/app');
const { logger } = require('./logger');

// Создаем экземпляр Redis
const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Обработчики событий Redis
redis.on('connect', () => {
    logger.info('Подключение к Redis успешно установлено');
});

redis.on('error', (error) => {
    logger.error('Ошибка подключения к Redis:', error);
});

redis.on('reconnecting', () => {
    logger.warn('Переподключение к Redis...');
});

// Функция для проверки подключения к Redis
const testConnection = async () => {
    try {
        await redis.ping();
        logger.info('Подключение к Redis успешно установлено');
        return true;
    } catch (error) {
        logger.error('Ошибка подключения к Redis:', error);
        return false;
    }
};

// Функция для закрытия соединения с Redis
const closeConnection = async () => {
    try {
        await redis.quit();
        logger.info('Соединение с Redis закрыто');
        return true;
    } catch (error) {
        logger.error('Ошибка закрытия соединения с Redis:', error);
        return false;
    }
};

// Функция для установки значения с временем жизни
const setWithExpiry = async (key, value, seconds) => {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', seconds);
        return true;
    } catch (error) {
        logger.error(`Ошибка установки значения для ключа ${key}:`, error);
        return false;
    }
};

// Функция для получения значения
const get = async (key) => {
    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        logger.error(`Ошибка получения значения для ключа ${key}:`, error);
        return null;
    }
};

// Функция для удаления значения
const del = async (key) => {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        logger.error(`Ошибка удаления значения для ключа ${key}:`, error);
        return false;
    }
};

module.exports = {
    redis,
    testConnection,
    closeConnection,
    setWithExpiry,
    get,
    del
}; 
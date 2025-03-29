const Redis = require('ioredis');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');

// Создаем клиент Redis
const redis = new Redis(config.redis);

// Получение значения из кэша
const get = async (key) => {
    try {
        const value = await redis.get(key);
        if (value) {
            logInfo(`Получено значение из кэша:`, { key });
            return JSON.parse(value);
        }
        return null;
    } catch (error) {
        logError(`Ошибка получения значения из кэша:`, { key, error });
        return null;
    }
};

// Сохранение значения в кэш
const set = async (key, value, ttl = 3600) => {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttl);
        logInfo(`Значение сохранено в кэш:`, { key, ttl });
    } catch (error) {
        logError(`Ошибка сохранения значения в кэш:`, { key, error });
        throw error;
    }
};

// Удаление значения из кэша
const del = async (key) => {
    try {
        await redis.del(key);
        logInfo(`Значение удалено из кэша:`, { key });
    } catch (error) {
        logError(`Ошибка удаления значения из кэша:`, { key, error });
        throw error;
    }
};

// Проверка существования ключа в кэше
const exists = async (key) => {
    try {
        const result = await redis.exists(key);
        return result === 1;
    } catch (error) {
        logError(`Ошибка проверки существования ключа в кэше:`, { key, error });
        return false;
    }
};

// Получение всех ключей по шаблону
const keys = async (pattern) => {
    try {
        const result = await redis.keys(pattern);
        return result;
    } catch (error) {
        logError(`Ошибка получения ключей из кэша:`, { pattern, error });
        return [];
    }
};

// Очистка кэша по шаблону
const clear = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            logInfo(`Кэш очищен по шаблону:`, { pattern, count: keys.length });
        }
    } catch (error) {
        logError(`Ошибка очистки кэша:`, { pattern, error });
        throw error;
    }
};

// Получение размера кэша
const size = async () => {
    try {
        const info = await redis.info();
        const lines = info.split('\n');
        const usedMemory = lines.find(line => line.startsWith('used_memory:'));
        return usedMemory ? parseInt(usedMemory.split(':')[1]) : 0;
    } catch (error) {
        logError(`Ошибка получения размера кэша:`, error);
        return 0;
    }
};

// Получение статистики кэша
const getStats = async () => {
    try {
        const info = await redis.info();
        const lines = info.split('\n');
        const stats = {};

        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                stats[key.trim()] = value.trim();
            }
        });

        logInfo(`Получена статистика кэша:`, stats);
        return stats;
    } catch (error) {
        logError(`Ошибка получения статистики кэша:`, error);
        return {};
    }
};

// Получение времени жизни ключа
const ttl = async (key) => {
    try {
        return await redis.ttl(key);
    } catch (error) {
        logError(`Ошибка получения времени жизни ключа:`, { key, error });
        return -1;
    }
};

// Установка времени жизни ключа
const expire = async (key, seconds) => {
    try {
        await redis.expire(key, seconds);
        logInfo(`Установлено время жизни ключа:`, { key, seconds });
    } catch (error) {
        logError(`Ошибка установки времени жизни ключа:`, { key, seconds, error });
        throw error;
    }
};

// Получение всех ключей с их значениями
const getAll = async () => {
    try {
        const keys = await redis.keys('*');
        const result = {};

        for (const key of keys) {
            const value = await redis.get(key);
            if (value) {
                result[key] = JSON.parse(value);
            }
        }

        return result;
    } catch (error) {
        logError(`Ошибка получения всех значений из кэша:`, error);
        return {};
    }
};

// Сохранение нескольких значений в кэш
const mset = async (values, ttl = 3600) => {
    try {
        const pipeline = redis.pipeline();
        for (const [key, value] of Object.entries(values)) {
            pipeline.set(key, JSON.stringify(value), 'EX', ttl);
        }
        await pipeline.exec();
        logInfo(`Сохранено несколько значений в кэш:`, { count: Object.keys(values).length });
    } catch (error) {
        logError(`Ошибка сохранения нескольких значений в кэш:`, error);
        throw error;
    }
};

// Получение нескольких значений из кэша
const mget = async (keys) => {
    try {
        const values = await redis.mget(keys);
        const result = {};
        keys.forEach((key, index) => {
            if (values[index]) {
                result[key] = JSON.parse(values[index]);
            }
        });
        return result;
    } catch (error) {
        logError(`Ошибка получения нескольких значений из кэша:`, error);
        return {};
    }
};

module.exports = {
    get,
    set,
    del,
    exists,
    keys,
    clear,
    size,
    getStats,
    ttl,
    expire,
    getAll,
    mset,
    mget
}; 
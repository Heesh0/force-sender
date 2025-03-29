const { logger } = require('./logger');

class Cache {
    constructor(options = {}) {
        this.cache = new Map();
        this.options = {
            maxSize: options.maxSize || 1000,
            defaultTTL: options.defaultTTL || 3600,
            checkPeriod: options.checkPeriod || 600
        };
        this.startCleanup();
    }

    // Добавление значения в кэш
    set(key, value, ttl = this.options.defaultTTL) {
        try {
            if (this.cache.size >= this.options.maxSize) {
                this.cleanup();
            }

            const entry = {
                value,
                expires: ttl ? Date.now() + ttl * 1000 : null
            };

            this.cache.set(key, entry);
            
            logger.info('Значение добавлено в кэш:', {
                key,
                ttl
            });

            return true;
        } catch (error) {
            logger.error('Ошибка добавления значения в кэш:', {
                error: error.message,
                key
            });
            throw error;
        }
    }

    // Получение значения из кэша
    get(key) {
        try {
            const entry = this.cache.get(key);
            
            if (!entry) {
                return null;
            }

            if (entry.expires && entry.expires < Date.now()) {
                this.cache.delete(key);
                return null;
            }

            logger.info('Значение получено из кэша:', {
                key
            });

            return entry.value;
        } catch (error) {
            logger.error('Ошибка получения значения из кэша:', {
                error: error.message,
                key
            });
            throw error;
        }
    }

    // Удаление значения из кэша
    delete(key) {
        try {
            const result = this.cache.delete(key);
            
            logger.info('Значение удалено из кэша:', {
                key,
                result
            });

            return result;
        } catch (error) {
            logger.error('Ошибка удаления значения из кэша:', {
                error: error.message,
                key
            });
            throw error;
        }
    }

    // Проверка наличия значения в кэше
    has(key) {
        try {
            const entry = this.cache.get(key);
            
            if (!entry) {
                return false;
            }

            if (entry.expires && entry.expires < Date.now()) {
                this.cache.delete(key);
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Ошибка проверки наличия значения в кэше:', {
                error: error.message,
                key
            });
            throw error;
        }
    }

    // Очистка кэша
    clear() {
        try {
            this.cache.clear();
            
            logger.info('Кэш очищен');
        } catch (error) {
            logger.error('Ошибка очистки кэша:', {
                error: error.message
            });
            throw error;
        }
    }

    // Получение размера кэша
    size() {
        return this.cache.size;
    }

    // Получение всех ключей
    keys() {
        return Array.from(this.cache.keys());
    }

    // Получение всех значений
    values() {
        return Array.from(this.cache.values()).map(entry => entry.value);
    }

    // Получение всех записей
    entries() {
        return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
    }

    // Очистка устаревших записей
    cleanup() {
        try {
            const now = Date.now();
            let count = 0;

            for (const [key, entry] of this.cache.entries()) {
                if (entry.expires && entry.expires < now) {
                    this.cache.delete(key);
                    count++;
                }
            }

            logger.info('Очистка устаревших записей:', {
                count
            });

            return count;
        } catch (error) {
            logger.error('Ошибка очистки устаревших записей:', {
                error: error.message
            });
            throw error;
        }
    }

    // Запуск периодической очистки
    startCleanup() {
        setInterval(() => {
            this.cleanup();
        }, this.options.checkPeriod * 1000);
    }

    // Получение статистики
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.options.maxSize,
            defaultTTL: this.options.defaultTTL,
            checkPeriod: this.options.checkPeriod
        };
    }
}

// Класс для работы с кэшем в памяти с поддержкой сериализации
class SerializableCache extends Cache {
    constructor(options = {}) {
        super(options);
    }

    // Сериализация значения
    serialize(value) {
        try {
            return JSON.stringify(value);
        } catch (error) {
            logger.error('Ошибка сериализации значения:', {
                error: error.message
            });
            throw error;
        }
    }

    // Десериализация значения
    deserialize(value) {
        try {
            return JSON.parse(value);
        } catch (error) {
            logger.error('Ошибка десериализации значения:', {
                error: error.message
            });
            throw error;
        }
    }

    // Добавление значения в кэш
    set(key, value, ttl = this.options.defaultTTL) {
        try {
            const serializedValue = this.serialize(value);
            return super.set(key, serializedValue, ttl);
        } catch (error) {
            logger.error('Ошибка добавления значения в кэш:', {
                error: error.message,
                key
            });
            throw error;
        }
    }

    // Получение значения из кэша
    get(key) {
        try {
            const serializedValue = super.get(key);
            
            if (serializedValue === null) {
                return null;
            }

            return this.deserialize(serializedValue);
        } catch (error) {
            logger.error('Ошибка получения значения из кэша:', {
                error: error.message,
                key
            });
            throw error;
        }
    }
}

// Класс для работы с кэшем в памяти с поддержкой сжатия
class CompressedCache extends Cache {
    constructor(options = {}) {
        super(options);
        this.compressionLevel = options.compressionLevel || 6;
    }

    // Сжатие значения
    compress(value) {
        try {
            const string = JSON.stringify(value);
            return Buffer.from(string).toString('base64');
        } catch (error) {
            logger.error('Ошибка сжатия значения:', {
                error: error.message
            });
            throw error;
        }
    }

    // Распаковка значения
    decompress(value) {
        try {
            const buffer = Buffer.from(value, 'base64');
            return JSON.parse(buffer.toString());
        } catch (error) {
            logger.error('Ошибка распаковки значения:', {
                error: error.message
            });
            throw error;
        }
    }

    // Добавление значения в кэш
    set(key, value, ttl = this.options.defaultTTL) {
        try {
            const compressedValue = this.compress(value);
            return super.set(key, compressedValue, ttl);
        } catch (error) {
            logger.error('Ошибка добавления значения в кэш:', {
                error: error.message,
                key
            });
            throw error;
        }
    }

    // Получение значения из кэша
    get(key) {
        try {
            const compressedValue = super.get(key);
            
            if (compressedValue === null) {
                return null;
            }

            return this.decompress(compressedValue);
        } catch (error) {
            logger.error('Ошибка получения значения из кэша:', {
                error: error.message,
                key
            });
            throw error;
        }
    }
}

module.exports = {
    Cache,
    SerializableCache,
    CompressedCache
}; 
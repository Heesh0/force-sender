const dotenv = require('dotenv');
const path = require('path');

// Загрузка переменных окружения из файла .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    // Настройки приложения
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        apiVersion: process.env.API_VERSION || 'v1'
    },

    // Настройки базы данных
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        name: process.env.DB_NAME || 'forcesender',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    },

    // Настройки Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },

    // Настройки JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Настройки логирования
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log'
    },

    // Настройки загрузки файлов
    upload: {
        maxSize: process.env.UPLOAD_MAX_SIZE || '5mb',
        allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(',')
    },

    // Настройки очереди
    queue: {
        maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS) || 3,
        backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY) || 1000
    }
};

const validateConfig = () => {
    const requiredEnvVars = [
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

const getConfig = (key) => {
    return key.split('.').reduce((obj, k) => obj && obj[k], config);
};

module.exports = {
    config,
    validateConfig,
    getConfig
}; 
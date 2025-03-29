require('dotenv').config();

module.exports = {
    // Основные настройки
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Настройки безопасности
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    
    // Настройки базы данных
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    },
    
    // Настройки Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0
    },
    
    // Настройки загрузки файлов
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['text/csv'],
        tempDir: 'uploads/temp'
    },
    
    // Настройки RuSender API
    rusender: {
        apiKey: process.env.RUSENDER_API_KEY,
        baseUrl: process.env.RUSENDER_API_URL || 'https://api.rusender.com/v1',
        timeout: 30000 // 30 секунд
    },
    
    // Настройки логирования
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        dir: process.env.LOG_DIR || 'logs'
    }
}; 
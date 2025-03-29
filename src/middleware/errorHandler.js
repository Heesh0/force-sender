const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Error:', err);

    // Обработка ошибок валидации
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Ошибка валидации',
            details: err.errors
        });
    }

    // Обработка ошибок Sequelize
    if (err.name === 'SequelizeError') {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                error: 'Нарушение уникальности',
                details: err.errors
            });
        }
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Ошибка валидации базы данных',
                details: err.errors
            });
        }
    }

    // Обработка ошибок JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Недействительный токен'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Срок действия токена истек'
        });
    }

    // Обработка ошибок API
    if (err.response) {
        return res.status(err.response.status).json({
            error: err.response.data.error || 'Ошибка API',
            details: err.response.data
        });
    }

    // Обработка остальных ошибок
    return res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler; 
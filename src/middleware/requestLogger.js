const { logger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Записываем время начала запроса
    const start = Date.now();

    // Логируем входящий запрос
    logger.info('Incoming request:', {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Добавляем обработчик для логирования ответа
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Response:', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
};

module.exports = requestLogger; 
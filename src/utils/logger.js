const winston = require('winston');
const path = require('path');
const { getConfig } = require('./configUtils');

const logLevel = getConfig('logging.level') || 'info';
const logFile = getConfig('logging.file') || 'logs/app.log';

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'forcesender' },
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: logFile
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

const logError = (message, error) => {
    logger.error(message, {
        error: error.message,
        stack: error.stack,
        ...error
    });
};

const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
};

const logWarn = (message, meta = {}) => {
    logger.warn(message, meta);
};

const logHttpRequest = (req, res, duration) => {
    logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
};

const logHttpError = (req, res, error) => {
    logger.error('HTTP Error', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        error: error.message,
        stack: error.stack,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
};

const logDatabaseQuery = (query, params, duration) => {
    logger.debug('Database Query', {
        query,
        params,
        duration: `${duration}ms`
    });
};

const logDatabaseError = (query, params, error) => {
    logger.error('Database Error', {
        query,
        params,
        error: error.message,
        stack: error.stack
    });
};

const logEmailSent = (to, subject, status) => {
    logger.info('Email Sent', {
        to,
        subject,
        status
    });
};

const logEmailError = (to, subject, error) => {
    logger.error('Email Error', {
        to,
        subject,
        error: error.message,
        stack: error.stack
    });
};

module.exports = {
    logger,
    logError,
    logInfo,
    logDebug,
    logWarn,
    logHttpRequest,
    logHttpError,
    logDatabaseQuery,
    logDatabaseError,
    logEmailSent,
    logEmailError
}; 
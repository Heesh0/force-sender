const winston = require('winston');
const path = require('path');
const { format } = winston;

// Создаем директорию для логов, если она не существует
const logDir = path.join(__dirname, '../../', config.logging.dir);
if (!require('fs').existsSync(logDir)) {
    require('fs').mkdirSync(logDir, { recursive: true });
}

// Форматирование логов
const logFormat = format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Форматирование консольных логов
const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(
        info => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Создаем логгер
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'mailing-service' },
    transports: [
        // Запись ошибок в файл
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Запись всех логов в файл
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Добавление консольного транспорта в режиме разработки
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Создаем стрим для Morgan
const stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Функция для логирования запросов
const logRequest = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });

    next();
};

// Функция для логирования ошибок
const logErrorWithRequest = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        name: error.name
    };

    if (req) {
        errorLog.request = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };
    }

    logger.error('Error occurred', errorLog);
};

// Функция для логирования бизнес-событий
const logBusinessEvent = (event, data = {}) => {
    logger.info('Business Event', {
        event,
        ...data
    });
};

// Функция для логирования метрик
const logMetric = (name, value, tags = {}) => {
    logger.info('Metric', {
        name,
        value,
        tags
    });
};

// Функция для логирования аудита
const logAudit = (action, user, details = {}) => {
    logger.info('Audit', {
        action,
        user,
        ...details
    });
};

// Функция для логирования безопасности
const logSecurity = (event, details = {}) => {
    logger.warn('Security Event', {
        event,
        ...details
    });
};

// Функция для логирования производительности
const logPerformance = (operation, duration, details = {}) => {
    logger.info('Performance', {
        operation,
        duration,
        ...details
    });
};

// Функция для логирования состояния системы
const logSystemState = (state, details = {}) => {
    logger.info('System State', {
        state,
        ...details
    });
};

// Функция для логирования конфигурации
const logConfig = (config) => {
    logger.info('Configuration', {
        config
    });
};

// Функция для логирования запуска/остановки
const logLifecycle = (event, details = {}) => {
    logger.info('Lifecycle', {
        event,
        ...details
    });
};

// Функция для логирования зависимостей
const logDependency = (name, status, details = {}) => {
    logger.info('Dependency', {
        name,
        status,
        ...details
    });
};

// Функция для логирования телеметрии
const logTelemetry = (data) => {
    logger.info('Telemetry', {
        data
    });
};

// Функция для логирования отладки
const logDebug = (message, data = {}) => {
    logger.debug('Debug', {
        message,
        ...data
    });
};

// Функция для логирования предупреждений
const logWarning = (message, data = {}) => {
    logger.warn('Warning', {
        message,
        ...data
    });
};

// Функция для логирования информации
const logInfo = (message, data = {}) => {
    logger.info('Info', {
        message,
        ...data
    });
};

// Функция для логирования ошибок
const logErrorWithDetails = (message, error, data = {}) => {
    logger.error('Error', {
        message,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        ...data
    });
};

// Функция для логирования критических ошибок
const logCritical = (message, error, data = {}) => {
    logger.error('Critical Error', {
        message,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        ...data
    });
};

module.exports = {
    logger,
    stream,
    logRequest,
    logErrorWithRequest,
    logBusinessEvent,
    logMetric,
    logAudit,
    logSecurity,
    logPerformance,
    logSystemState,
    logConfig,
    logLifecycle,
    logDependency,
    logTelemetry,
    logDebug,
    logWarning,
    logInfo,
    logErrorWithDetails,
    logCritical
}; 
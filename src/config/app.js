const { getConfig } = require('../utils/configUtils');

module.exports = {
    app: {
        name: 'ForceSender',
        version: '1.0.0',
        port: getConfig('app.port') || 3000,
        host: getConfig('app.host') || 'localhost',
        env: getConfig('app.env') || 'development',
        timezone: getConfig('app.timezone') || 'UTC',
        secret: getConfig('app.secret') || 'your-secret-key',
        session: {
            secret: getConfig('app.session.secret') || 'session-secret-key',
            resave: getConfig('app.session.resave') || false,
            saveUninitialized: getConfig('app.session.saveUninitialized') || false,
            cookie: {
                secure: getConfig('app.session.cookie.secure') || false,
                maxAge: getConfig('app.session.cookie.maxAge') || 24 * 60 * 60 * 1000 // 24 hours
            }
        }
    },
    cors: {
        enabled: getConfig('cors.enabled') || true,
        origin: getConfig('cors.origin') || '*',
        methods: getConfig('cors.methods') || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: getConfig('cors.allowedHeaders') || ['Content-Type', 'Authorization'],
        exposedHeaders: getConfig('cors.exposedHeaders') || [],
        credentials: getConfig('cors.credentials') || true,
        maxAge: getConfig('cors.maxAge') || 86400 // 24 hours
    },
    upload: {
        maxSize: getConfig('upload.maxSize') || 10, // MB
        allowedTypes: getConfig('upload.allowedTypes') || [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        tempDir: getConfig('upload.tempDir') || 'uploads/temp',
        finalDir: getConfig('upload.finalDir') || 'uploads/final'
    },
    redis: {
        host: getConfig('redis.host') || 'localhost',
        port: getConfig('redis.port') || 6379,
        password: getConfig('redis.password') || '',
        db: getConfig('redis.db') || 0,
        keyPrefix: getConfig('redis.keyPrefix') || 'forcesender:'
    },
    logging: {
        level: getConfig('logging.level') || 'info',
        format: getConfig('logging.format') || 'combined',
        transports: getConfig('logging.transports') || ['console', 'file'],
        filename: getConfig('logging.filename') || 'logs/app.log',
        maxSize: getConfig('logging.maxSize') || 10485760, // 10MB
        maxFiles: getConfig('logging.maxFiles') || 5
    },
    email: {
        from: getConfig('email.from') || 'noreply@forcesender.com',
        replyTo: getConfig('email.replyTo') || 'support@forcesender.com',
        templates: {
            welcome: getConfig('email.templates.welcome') || 'welcome',
            resetPassword: getConfig('email.templates.resetPassword') || 'reset-password',
            notification: getConfig('email.templates.notification') || 'notification'
        }
    },
    security: {
        bcryptRounds: getConfig('security.bcryptRounds') || 10,
        jwtSecret: getConfig('security.jwtSecret') || 'jwt-secret-key',
        jwtExpiresIn: getConfig('security.jwtExpiresIn') || '24h',
        rateLimit: {
            windowMs: getConfig('security.rateLimit.windowMs') || 15 * 60 * 1000, // 15 minutes
            max: getConfig('security.rateLimit.max') || 100 // limit each IP to 100 requests per windowMs
        }
    },
    monitoring: {
        enabled: getConfig('monitoring.enabled') || true,
        metrics: {
            enabled: getConfig('monitoring.metrics.enabled') || true,
            path: getConfig('monitoring.metrics.path') || '/metrics'
        },
        health: {
            enabled: getConfig('monitoring.health.enabled') || true,
            path: getConfig('monitoring.health.path') || '/health'
        }
    }
}; 
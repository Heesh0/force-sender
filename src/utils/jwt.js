const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

// Функция для создания токена
const createToken = (payload, options = {}) => {
    try {
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: options.expiresIn || '24h',
                algorithm: 'HS256',
                ...options
            }
        );

        logger.info('Создан токен:', {
            userId: payload.userId,
            expiresIn: options.expiresIn || '24h'
        });

        return token;
    } catch (error) {
        logger.error('Ошибка создания токена:', {
            error: error.message,
            payload
        });
        throw error;
    }
};

// Функция для проверки токена
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info('Токен проверен:', {
            userId: decoded.userId,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
        return decoded;
    } catch (error) {
        logger.error('Ошибка проверки токена:', {
            error: error.message,
            token: token.substring(0, 10) + '...'
        });
        throw error;
    }
};

// Функция для создания refresh токена
const createRefreshToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: '7d',
                algorithm: 'HS256'
            }
        );

        logger.info('Создан refresh токен:', {
            userId: payload.userId,
            expiresIn: '7d'
        });

        return token;
    } catch (error) {
        logger.error('Ошибка создания refresh токена:', {
            error: error.message,
            payload
        });
        throw error;
    }
};

// Функция для проверки refresh токена
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        logger.info('Refresh токен проверен:', {
            userId: decoded.userId,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
        return decoded;
    } catch (error) {
        logger.error('Ошибка проверки refresh токена:', {
            error: error.message,
            token: token.substring(0, 10) + '...'
        });
        throw error;
    }
};

// Функция для создания токена сброса пароля
const createPasswordResetToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            process.env.JWT_PASSWORD_RESET_SECRET,
            {
                expiresIn: '1h',
                algorithm: 'HS256'
            }
        );

        logger.info('Создан токен сброса пароля:', {
            userId: payload.userId,
            expiresIn: '1h'
        });

        return token;
    } catch (error) {
        logger.error('Ошибка создания токена сброса пароля:', {
            error: error.message,
            payload
        });
        throw error;
    }
};

// Функция для проверки токена сброса пароля
const verifyPasswordResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_PASSWORD_RESET_SECRET);
        logger.info('Токен сброса пароля проверен:', {
            userId: decoded.userId,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
        return decoded;
    } catch (error) {
        logger.error('Ошибка проверки токена сброса пароля:', {
            error: error.message,
            token: token.substring(0, 10) + '...'
        });
        throw error;
    }
};

// Функция для создания токена подтверждения email
const createEmailVerificationToken = (payload) => {
    try {
        const token = jwt.sign(
            payload,
            process.env.JWT_EMAIL_VERIFICATION_SECRET,
            {
                expiresIn: '24h',
                algorithm: 'HS256'
            }
        );

        logger.info('Создан токен подтверждения email:', {
            userId: payload.userId,
            email: payload.email,
            expiresIn: '24h'
        });

        return token;
    } catch (error) {
        logger.error('Ошибка создания токена подтверждения email:', {
            error: error.message,
            payload
        });
        throw error;
    }
};

// Функция для проверки токена подтверждения email
const verifyEmailVerificationToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_EMAIL_VERIFICATION_SECRET);
        logger.info('Токен подтверждения email проверен:', {
            userId: decoded.userId,
            email: decoded.email,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
        return decoded;
    } catch (error) {
        logger.error('Ошибка проверки токена подтверждения email:', {
            error: error.message,
            token: token.substring(0, 10) + '...'
        });
        throw error;
    }
};

// Функция для декодирования токена без проверки
const decodeToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        logger.info('Токен декодирован:', {
            userId: decoded.userId,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
        return decoded;
    } catch (error) {
        logger.error('Ошибка декодирования токена:', {
            error: error.message,
            token: token.substring(0, 10) + '...'
        });
        throw error;
    }
};

// Функция для проверки срока действия токена
const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp < now;
    } catch (error) {
        logger.error('Ошибка проверки срока действия токена:', {
            error: error.message,
            token: token.substring(0, 10) + '...'
        });
        throw error;
    }
};

module.exports = {
    createToken,
    verifyToken,
    createRefreshToken,
    verifyRefreshToken,
    createPasswordResetToken,
    verifyPasswordResetToken,
    createEmailVerificationToken,
    verifyEmailVerificationToken,
    decodeToken,
    isTokenExpired
}; 
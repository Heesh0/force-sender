const { logger } = require('./logger');

// Базовый класс для ошибок приложения
class AppError extends Error {
    constructor(message, code = 500, details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Сохраняем стек вызовов
        Error.captureStackTrace(this, this.constructor);
    }
}

// Класс для ошибок валидации
class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, details);
        this.name = 'ValidationError';
    }
}

// Класс для ошибок авторизации
class AuthError extends AppError {
    constructor(message, details = null) {
        super(message, 401, details);
        this.name = 'AuthError';
    }
}

// Класс для ошибок доступа
class ForbiddenError extends AppError {
    constructor(message, details = null) {
        super(message, 403, details);
        this.name = 'ForbiddenError';
    }
}

// Класс для ошибок "не найдено"
class NotFoundError extends AppError {
    constructor(message, details = null) {
        super(message, 404, details);
        this.name = 'NotFoundError';
    }
}

// Класс для ошибок конфликта
class ConflictError extends AppError {
    constructor(message, details = null) {
        super(message, 409, details);
        this.name = 'ConflictError';
    }
}

// Класс для ошибок сервера
class ServerError extends AppError {
    constructor(message, details = null) {
        super(message, 500, details);
        this.name = 'ServerError';
    }
}

// Функция для обработки ошибок
const handleError = (error) => {
    // Логируем ошибку
    logger.error('Ошибка:', {
        name: error.name,
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
    });

    // Если это наша ошибка, возвращаем её как есть
    if (error instanceof AppError) {
        return error;
    }

    // Для неизвестных ошибок создаем ServerError
    return new ServerError(
        'Внутренняя ошибка сервера',
        error.message
    );
};

// Функция для создания ошибки валидации
const createValidationError = (message, details = null) => {
    return new ValidationError(message, details);
};

// Функция для создания ошибки авторизации
const createAuthError = (message, details = null) => {
    return new AuthError(message, details);
};

// Функция для создания ошибки доступа
const createForbiddenError = (message, details = null) => {
    return new ForbiddenError(message, details);
};

// Функция для создания ошибки "не найдено"
const createNotFoundError = (message, details = null) => {
    return new NotFoundError(message, details);
};

// Функция для создания ошибки конфликта
const createConflictError = (message, details = null) => {
    return new ConflictError(message, details);
};

// Функция для создания ошибки сервера
const createServerError = (message, details = null) => {
    return new ServerError(message, details);
};

// Функция для проверки является ли ошибка ошибкой приложения
const isAppError = (error) => {
    return error instanceof AppError;
};

// Функция для получения кода ошибки
const getErrorCode = (error) => {
    return isAppError(error) ? error.code : 500;
};

// Функция для получения деталей ошибки
const getErrorDetails = (error) => {
    return isAppError(error) ? error.details : null;
};

// Функция для форматирования ошибки для ответа
const formatError = (error) => {
    const appError = handleError(error);
    return {
        error: {
            name: appError.name,
            message: appError.message,
            code: appError.code,
            details: appError.details,
            timestamp: appError.timestamp
        }
    };
};

// Функция для логирования ошибки
const logError = (error, context = {}) => {
    const appError = handleError(error);
    logger.error('Ошибка:', {
        ...context,
        name: appError.name,
        message: appError.message,
        code: appError.code,
        details: appError.details,
        stack: appError.stack,
        timestamp: appError.timestamp
    });
};

module.exports = {
    AppError,
    ValidationError,
    AuthError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ServerError,
    handleError,
    createValidationError,
    createAuthError,
    createForbiddenError,
    createNotFoundError,
    createConflictError,
    createServerError,
    isAppError,
    getErrorCode,
    getErrorDetails,
    formatError,
    logError
}; 
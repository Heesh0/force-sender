const { logger } = require('./logger');

// Функция для успешного ответа
const success = (data = null, message = 'Успешно') => {
    return {
        success: true,
        message,
        data
    };
};

// Функция для ответа с пагинацией
const paginated = (data, total, page, limit) => {
    return {
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

// Функция для ответа с метаданными
const withMeta = (data, meta) => {
    return {
        success: true,
        data,
        meta
    };
};

// Функция для ответа с предупреждением
const warning = (message, data = null) => {
    return {
        success: true,
        warning: true,
        message,
        data
    };
};

// Функция для ответа с ошибкой
const error = (message, code = 500, details = null) => {
    return {
        success: false,
        error: {
            message,
            code,
            details,
            timestamp: new Date().toISOString()
        }
    };
};

// Функция для логирования ответа
const logResponse = (response, context = {}) => {
    logger.info('Ответ API:', {
        ...context,
        success: response.success,
        message: response.message,
        data: response.data,
        error: response.error,
        timestamp: new Date().toISOString()
    });
};

// Функция для форматирования ответа
const formatResponse = (response) => {
    // Если ответ уже отформатирован
    if (response.success !== undefined) {
        return response;
    }

    // Если ответ содержит ошибку
    if (response.error) {
        return error(
            response.error.message,
            response.error.code,
            response.error.details
        );
    }

    // Если ответ содержит данные
    return success(response);
};

// Функция для создания ответа с задержкой
const delayed = async (response, delay) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return response;
};

// Функция для создания ответа с кэшированием
const cached = (response, ttl) => {
    return {
        ...response,
        cache: {
            ttl,
            timestamp: new Date().toISOString()
        }
    };
};

// Функция для создания ответа с версией
const versioned = (response, version) => {
    return {
        ...response,
        version
    };
};

// Функция для создания ответа с токеном
const withToken = (response, token) => {
    return {
        ...response,
        token
    };
};

// Функция для создания ответа с редиректом
const redirect = (url, status = 302) => {
    return {
        success: true,
        redirect: {
            url,
            status
        }
    };
};

// Функция для создания ответа с файлом
const file = (path, filename, contentType) => {
    return {
        success: true,
        file: {
            path,
            filename,
            contentType
        }
    };
};

// Функция для создания ответа с потоком
const stream = (stream, filename, contentType) => {
    return {
        success: true,
        stream: {
            stream,
            filename,
            contentType
        }
    };
};

module.exports = {
    success,
    paginated,
    withMeta,
    warning,
    error,
    logResponse,
    formatResponse,
    delayed,
    cached,
    versioned,
    withToken,
    redirect,
    file,
    stream
}; 
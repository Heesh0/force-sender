const axios = require('axios');
const logger = require('./logger');

const createApiClient = (baseURL, headers = {}) => {
    return axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        timeout: 30000,
        validateStatus: status => status >= 200 && status < 300
    });
};

const handleApiError = (error) => {
    if (error.response) {
        // Сервер ответил с ошибкой
        logger.error('API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
        });
        throw new Error(error.response.data.message || 'API request failed');
    } else if (error.request) {
        // Запрос был сделан, но ответ не получен
        logger.error('API Request Error:', error.request);
        throw new Error('No response received from API');
    } else {
        // Ошибка при настройке запроса
        logger.error('API Setup Error:', error.message);
        throw new Error('Failed to setup API request');
    }
};

const makeApiRequest = async (method, url, data = null, headers = {}) => {
    try {
        const client = createApiClient(url, headers);
        const response = await client[method.toLowerCase()](url, data);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

const validateApiResponse = (response, schema) => {
    const { error } = schema.validate(response);
    if (error) {
        logger.error('API Response Validation Error:', error);
        throw new Error('Invalid API response format');
    }
    return response;
};

const retryApiRequest = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                continue;
            }
        }
    }
    
    throw lastError;
};

const createApiResponse = (success, data = null, message = '') => {
    return {
        success,
        data,
        message,
        timestamp: new Date().toISOString()
    };
};

const createApiError = (message, code = 500, details = null) => {
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

const validateApiRequest = (data, schema) => {
    const { error } = schema.validate(data);
    if (error) {
        logger.error('API Request Validation Error:', error);
        throw new Error(error.details[0].message);
    }
    return data;
};

const handleApiTimeout = async (promise, timeout = 30000) => {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
};

const createApiMiddleware = (handler) => {
    return async (req, res, next) => {
        try {
            const result = await handler(req, res);
            res.json(createApiResponse(true, result));
        } catch (error) {
            logger.error('API Middleware Error:', error);
            res.status(error.status || 500).json(createApiError(error.message, error.status || 500));
        }
    };
};

module.exports = {
    createApiClient,
    handleApiError,
    makeApiRequest,
    validateApiResponse,
    retryApiRequest,
    createApiResponse,
    createApiError,
    validateApiRequest,
    handleApiTimeout,
    createApiMiddleware
}; 
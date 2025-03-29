const axios = require('axios');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');

// Создаем экземпляр axios с настройками по умолчанию
const httpClient = axios.create({
    timeout: config.http.timeout,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': config.http.userAgent
    }
});

// Добавляем перехватчик для логирования запросов
httpClient.interceptors.request.use(
    (config) => {
        logInfo('Отправка HTTP запроса:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        logError('Ошибка при отправке HTTP запроса:', error);
        return Promise.reject(error);
    }
);

// Добавляем перехватчик для логирования ответов
httpClient.interceptors.response.use(
    (response) => {
        logInfo('Получен HTTP ответ:', {
            status: response.status,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    (error) => {
        logError('Ошибка при получении HTTP ответа:', error);
        return Promise.reject(error);
    }
);

// GET запрос
const get = async (url, params = {}, headers = {}) => {
    try {
        const response = await httpClient.get(url, { params, headers });
        return response.data;
    } catch (error) {
        logError('Ошибка при выполнении GET запроса:', { url, error });
        throw error;
    }
};

// POST запрос
const post = async (url, data = {}, headers = {}) => {
    try {
        const response = await httpClient.post(url, data, { headers });
        return response.data;
    } catch (error) {
        logError('Ошибка при выполнении POST запроса:', { url, error });
        throw error;
    }
};

// PUT запрос
const put = async (url, data = {}, headers = {}) => {
    try {
        const response = await httpClient.put(url, data, { headers });
        return response.data;
    } catch (error) {
        logError('Ошибка при выполнении PUT запроса:', { url, error });
        throw error;
    }
};

// DELETE запрос
const del = async (url, headers = {}) => {
    try {
        const response = await httpClient.delete(url, { headers });
        return response.data;
    } catch (error) {
        logError('Ошибка при выполнении DELETE запроса:', { url, error });
        throw error;
    }
};

// PATCH запрос
const patch = async (url, data = {}, headers = {}) => {
    try {
        const response = await httpClient.patch(url, data, { headers });
        return response.data;
    } catch (error) {
        logError('Ошибка при выполнении PATCH запроса:', { url, error });
        throw error;
    }
};

// Загрузка файла
const uploadFile = async (url, file, onProgress = null) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await httpClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            }
        });

        return response.data;
    } catch (error) {
        logError('Ошибка при загрузке файла:', { url, error });
        throw error;
    }
};

// Скачивание файла
const downloadFile = async (url, onProgress = null) => {
    try {
        const response = await httpClient.get(url, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            }
        });

        return response.data;
    } catch (error) {
        logError('Ошибка при скачивании файла:', { url, error });
        throw error;
    }
};

// Проверка доступности URL
const checkUrl = async (url, timeout = 5000) => {
    try {
        const response = await httpClient.get(url, { timeout });
        return {
            available: true,
            status: response.status,
            responseTime: response.headers['x-response-time']
        };
    } catch (error) {
        return {
            available: false,
            error: error.message
        };
    }
};

// Получение заголовков URL
const getHeaders = async (url) => {
    try {
        const response = await httpClient.head(url);
        return response.headers;
    } catch (error) {
        logError('Ошибка при получении заголовков:', { url, error });
        throw error;
    }
};

// Выполнение запроса с повторными попытками
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    throw lastError;
};

// Проверка SSL сертификата
const checkSSL = async (url) => {
    try {
        const response = await httpClient.get(url);
        const cert = response.request.res.socket.getPeerCertificate();
        return {
            valid: true,
            issuer: cert.issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            subject: cert.subject
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
};

module.exports = {
    httpClient,
    get,
    post,
    put,
    del,
    patch,
    uploadFile,
    downloadFile,
    checkUrl,
    getHeaders,
    retryRequest,
    checkSSL
}; 
const axios = require('axios');
const { logger } = require('./logger');

// Функция для выполнения GET-запроса
const get = async (url, options = {}) => {
    try {
        const response = await axios.get(url, options);
        
        logger.info('GET запрос выполнен:', {
            url,
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error) {
        logger.error('Ошибка GET запроса:', {
            error: error.message,
            url,
            options
        });
        throw error;
    }
};

// Функция для выполнения POST-запроса
const post = async (url, data, options = {}) => {
    try {
        const response = await axios.post(url, data, options);
        
        logger.info('POST запрос выполнен:', {
            url,
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error) {
        logger.error('Ошибка POST запроса:', {
            error: error.message,
            url,
            data,
            options
        });
        throw error;
    }
};

// Функция для выполнения PUT-запроса
const put = async (url, data, options = {}) => {
    try {
        const response = await axios.put(url, data, options);
        
        logger.info('PUT запрос выполнен:', {
            url,
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error) {
        logger.error('Ошибка PUT запроса:', {
            error: error.message,
            url,
            data,
            options
        });
        throw error;
    }
};

// Функция для выполнения DELETE-запроса
const del = async (url, options = {}) => {
    try {
        const response = await axios.delete(url, options);
        
        logger.info('DELETE запрос выполнен:', {
            url,
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error) {
        logger.error('Ошибка DELETE запроса:', {
            error: error.message,
            url,
            options
        });
        throw error;
    }
};

// Функция для выполнения PATCH-запроса
const patch = async (url, data, options = {}) => {
    try {
        const response = await axios.patch(url, data, options);
        
        logger.info('PATCH запрос выполнен:', {
            url,
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error) {
        logger.error('Ошибка PATCH запроса:', {
            error: error.message,
            url,
            data,
            options
        });
        throw error;
    }
};

// Функция для выполнения запроса с повторными попытками
const requestWithRetry = async (config, options = {}) => {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        retryCondition = (error) => error.response?.status >= 500
    } = options;

    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios(config);
            
            logger.info('Запрос выполнен:', {
                url: config.url,
                method: config.method,
                status: response.status,
                attempt: i + 1
            });

            return response.data;
        } catch (error) {
            lastError = error;

            if (!retryCondition(error) || i === maxRetries - 1) {
                break;
            }

            logger.warn('Повторная попытка запроса:', {
                url: config.url,
                method: config.method,
                attempt: i + 1,
                delay: retryDelay
            });

            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }

    logger.error('Запрос не выполнен после всех попыток:', {
        error: lastError.message,
        url: config.url,
        method: config.method,
        attempts: maxRetries
    });

    throw lastError;
};

// Функция для выполнения параллельных запросов
const requestAll = async (requests) => {
    try {
        const responses = await Promise.all(requests.map(request => axios(request)));
        
        logger.info('Параллельные запросы выполнены:', {
            count: requests.length,
            statuses: responses.map(r => r.status)
        });

        return responses.map(r => r.data);
    } catch (error) {
        logger.error('Ошибка выполнения параллельных запросов:', {
            error: error.message,
            count: requests.length
        });
        throw error;
    }
};

// Функция для выполнения последовательных запросов
const requestSequence = async (requests) => {
    try {
        const results = [];

        for (const request of requests) {
            const response = await axios(request);
            results.push(response.data);
        }
        
        logger.info('Последовательные запросы выполнены:', {
            count: requests.length,
            statuses: results.map(r => r.status)
        });

        return results;
    } catch (error) {
        logger.error('Ошибка выполнения последовательных запросов:', {
            error: error.message,
            count: requests.length
        });
        throw error;
    }
};

// Функция для проверки доступности URL
const checkUrl = async (url, options = {}) => {
    try {
        const {
            timeout = 5000,
            method = 'HEAD'
        } = options;

        const response = await axios({
            url,
            method,
            timeout,
            validateStatus: status => status < 400
        });

        logger.info('URL доступен:', {
            url,
            status: response.status
        });

        return true;
    } catch (error) {
        logger.warn('URL недоступен:', {
            error: error.message,
            url
        });
        return false;
    }
};

// Функция для загрузки файла
const downloadFile = async (url, options = {}) => {
    try {
        const {
            responseType = 'arraybuffer',
            onProgress
        } = options;

        const response = await axios({
            url,
            method: 'GET',
            responseType,
            onDownloadProgress: onProgress
        });

        logger.info('Файл загружен:', {
            url,
            size: response.data.length
        });

        return response.data;
    } catch (error) {
        logger.error('Ошибка загрузки файла:', {
            error: error.message,
            url
        });
        throw error;
    }
};

// Функция для загрузки файла
const uploadFile = async (url, file, options = {}) => {
    try {
        const {
            fieldName = 'file',
            onProgress
        } = options;

        const formData = new FormData();
        formData.append(fieldName, file);

        const response = await axios({
            url,
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: onProgress
        });

        logger.info('Файл загружен:', {
            url,
            size: file.size
        });

        return response.data;
    } catch (error) {
        logger.error('Ошибка загрузки файла:', {
            error: error.message,
            url
        });
        throw error;
    }
};

module.exports = {
    get,
    post,
    put,
    del,
    patch,
    requestWithRetry,
    requestAll,
    requestSequence,
    checkUrl,
    downloadFile,
    uploadFile
}; 
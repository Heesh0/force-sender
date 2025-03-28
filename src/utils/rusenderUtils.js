const axios = require('axios');
const { getConfig } = require('./configUtils');
const logger = require('./logger');

const API_URL = 'https://api.beta.rusender.ru/api/v1/external-mails/send';

const createHeaders = (apiKey) => ({
    'Content-Type': 'application/json',
    'X-Api-Key': apiKey
});

const prepareEmailData = (data) => {
    const { to, from, subject, previewTitle, templateId, templateParams } = data;

    return {
        mail: {
            to: {
                email: to.email,
                name: to.name || ''
            },
            from: {
                email: from.email,
                name: from.name || ''
            },
            subject,
            previewTitle,
            templateId,
            templateParams
        }
    };
};

const sendEmail = async (data) => {
    try {
        const apiKey = data.apiKey || getConfig('rusender.apiKey');
        if (!apiKey) {
            throw new Error('API ключ не указан');
        }

        const headers = createHeaders(apiKey);
        const emailData = prepareEmailData(data);

        const response = await axios.post(API_URL, emailData, { headers });
        logger.info(`Письмо успешно отправлено на ${data.to.email}`);
        return response.data;
    } catch (error) {
        logger.error(`Ошибка при отправке письма на ${data.to.email}:`, error.response?.data || error.message);
        throw error;
    }
};

const validateEmailData = (data) => {
    const requiredFields = ['to', 'from', 'subject', 'previewTitle', 'templateId'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
        throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
    }

    if (!data.to.email) {
        throw new Error('Не указан email получателя');
    }

    if (!data.from.email) {
        throw new Error('Не указан email отправителя');
    }

    return true;
};

const batchSendEmails = async (emails, batchSize = 10) => {
    try {
        const results = [];
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const batchPromises = batch.map(email => sendEmail(email));
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
            
            // Добавляем задержку между батчами
            if (i + batchSize < emails.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return results;
    } catch (error) {
        logger.error('Ошибка при пакетной отправке писем:', error);
        throw error;
    }
};

const getEmailStatus = async (messageId, apiKey) => {
    try {
        const headers = createHeaders(apiKey);
        const response = await axios.get(`${API_URL}/${messageId}`, { headers });
        return response.data;
    } catch (error) {
        logger.error(`Ошибка при получении статуса письма ${messageId}:`, error.response?.data || error.message);
        throw error;
    }
};

const cancelEmail = async (messageId, apiKey) => {
    try {
        const headers = createHeaders(apiKey);
        const response = await axios.delete(`${API_URL}/${messageId}`, { headers });
        logger.info(`Письмо ${messageId} успешно отменено`);
        return response.data;
    } catch (error) {
        logger.error(`Ошибка при отмене письма ${messageId}:`, error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendEmail,
    validateEmailData,
    batchSendEmails,
    getEmailStatus,
    cancelEmail
}; 
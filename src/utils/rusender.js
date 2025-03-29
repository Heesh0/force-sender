const axios = require('axios');
const config = require('../config/app');
const { logger } = require('./logger');

// Создаем экземпляр axios для работы с API
const api = axios.create({
    baseURL: config.rusender.baseUrl,
    timeout: config.rusender.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.rusender.apiKey}`
    }
});

// Функция для проверки подключения к API
const testConnection = async () => {
    try {
        await api.get('/health');
        logger.info('Подключение к API RuSender успешно установлено');
        return true;
    } catch (error) {
        logger.error('Ошибка подключения к API RuSender:', error);
        return false;
    }
};

// Функция для отправки email
const sendEmail = async (params) => {
    try {
        const response = await api.post('/emails', params);
        logger.info('Email успешно отправлен:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Ошибка отправки email:', error);
        throw error;
    }
};

// Функция для проверки статуса отправки
const checkDeliveryStatus = async (messageId) => {
    try {
        const response = await api.get(`/emails/${messageId}`);
        logger.info('Статус отправки получен:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Ошибка получения статуса отправки:', error);
        throw error;
    }
};

// Функция для получения статистики
const getStatistics = async (params = {}) => {
    try {
        const response = await api.get('/statistics', { params });
        logger.info('Статистика получена:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Ошибка получения статистики:', error);
        throw error;
    }
};

// Функция для проверки домена
const verifyDomain = async (domain) => {
    try {
        const response = await api.post('/domains/verify', { domain });
        logger.info('Домен проверен:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Ошибка проверки домена:', error);
        throw error;
    }
};

// Функция для получения списка шаблонов
const getTemplates = async (domain) => {
    try {
        const response = await api.get(`/domains/${domain}/templates`);
        logger.info('Шаблоны получены:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Ошибка получения шаблонов:', error);
        throw error;
    }
};

// Функция для получения деталей шаблона
const getTemplateDetails = async (domain, templateId) => {
    try {
        const response = await api.get(`/domains/${domain}/templates/${templateId}`);
        logger.info('Детали шаблона получены:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Ошибка получения деталей шаблона:', error);
        throw error;
    }
};

module.exports = {
    testConnection,
    sendEmail,
    checkDeliveryStatus,
    getStatistics,
    verifyDomain,
    getTemplates,
    getTemplateDetails
}; 
const client = require('prom-client');
const { getConfig } = require('./configUtils');
const logger = require('./logger');

// Регистрируем метрики
const register = new client.Registry();

// Метрики кампаний
const campaignMetrics = {
    totalEmails: new client.Counter({
        name: 'campaign_total_emails',
        help: 'Общее количество писем в кампании',
        labelNames: ['campaign_id', 'domain']
    }),
    sentEmails: new client.Counter({
        name: 'campaign_sent_emails',
        help: 'Количество отправленных писем',
        labelNames: ['campaign_id', 'domain']
    }),
    failedEmails: new client.Counter({
        name: 'campaign_failed_emails',
        help: 'Количество неудачных отправок',
        labelNames: ['campaign_id', 'domain']
    }),
    openRate: new client.Gauge({
        name: 'campaign_open_rate',
        help: 'Процент открытий писем',
        labelNames: ['campaign_id', 'domain']
    }),
    clickRate: new client.Gauge({
        name: 'campaign_click_rate',
        help: 'Процент кликов по ссылкам',
        labelNames: ['campaign_id', 'domain']
    })
};

// Метрики отправителей
const senderMetrics = {
    totalEmails: new client.Counter({
        name: 'sender_total_emails',
        help: 'Общее количество писем от отправителя',
        labelNames: ['domain']
    }),
    successfulDeliveries: new client.Counter({
        name: 'sender_successful_deliveries',
        help: 'Количество успешных доставок',
        labelNames: ['domain']
    }),
    failedDeliveries: new client.Counter({
        name: 'sender_failed_deliveries',
        help: 'Количество неудачных доставок',
        labelNames: ['domain']
    }),
    bounceRate: new client.Gauge({
        name: 'sender_bounce_rate',
        help: 'Процент отказов',
        labelNames: ['domain']
    }),
    spamRate: new client.Gauge({
        name: 'sender_spam_rate',
        help: 'Процент попадания в спам',
        labelNames: ['domain']
    })
};

// Системные метрики
const systemMetrics = {
    activeCampaigns: new client.Gauge({
        name: 'system_active_campaigns',
        help: 'Количество активных кампаний'
    }),
    queueSize: new client.Gauge({
        name: 'system_queue_size',
        help: 'Размер очереди задач',
        labelNames: ['status']
    }),
    processingTime: new client.Histogram({
        name: 'system_processing_time',
        help: 'Время обработки писем',
        buckets: [0.1, 0.5, 1, 2, 5]
    }),
    errorRate: new client.Gauge({
        name: 'system_error_rate',
        help: 'Процент ошибок в системе'
    })
};

// Регистрируем все метрики
Object.values(campaignMetrics).forEach(metric => register.registerMetric(metric));
Object.values(senderMetrics).forEach(metric => register.registerMetric(metric));
Object.values(systemMetrics).forEach(metric => register.registerMetric(metric));

const updateCampaignMetrics = async (campaignId, domain, metrics) => {
    try {
        const { totalEmails, sentEmails, failedEmails, openRate, clickRate } = metrics;
        
        if (totalEmails) campaignMetrics.totalEmails.inc({ campaign_id: campaignId, domain }, totalEmails);
        if (sentEmails) campaignMetrics.sentEmails.inc({ campaign_id: campaignId, domain }, sentEmails);
        if (failedEmails) campaignMetrics.failedEmails.inc({ campaign_id: campaignId, domain }, failedEmails);
        if (openRate) campaignMetrics.openRate.set({ campaign_id: campaignId, domain }, openRate);
        if (clickRate) campaignMetrics.clickRate.set({ campaign_id: campaignId, domain }, clickRate);

        logger.debug(`Обновлены метрики кампании ${campaignId}`);
    } catch (error) {
        logger.error(`Ошибка при обновлении метрик кампании ${campaignId}:`, error);
        throw error;
    }
};

const updateSenderMetrics = async (domain, metrics) => {
    try {
        const { totalEmails, successfulDeliveries, failedDeliveries, bounceRate, spamRate } = metrics;
        
        if (totalEmails) senderMetrics.totalEmails.inc({ domain }, totalEmails);
        if (successfulDeliveries) senderMetrics.successfulDeliveries.inc({ domain }, successfulDeliveries);
        if (failedDeliveries) senderMetrics.failedDeliveries.inc({ domain }, failedDeliveries);
        if (bounceRate) senderMetrics.bounceRate.set({ domain }, bounceRate);
        if (spamRate) senderMetrics.spamRate.set({ domain }, spamRate);

        logger.debug(`Обновлены метрики отправителя ${domain}`);
    } catch (error) {
        logger.error(`Ошибка при обновлении метрик отправителя ${domain}:`, error);
        throw error;
    }
};

const updateSystemMetrics = async (metrics) => {
    try {
        const { activeCampaigns, queueSize, processingTime, errorRate } = metrics;
        
        if (activeCampaigns !== undefined) systemMetrics.activeCampaigns.set(activeCampaigns);
        if (queueSize) {
            Object.entries(queueSize).forEach(([status, size]) => {
                systemMetrics.queueSize.set({ status }, size);
            });
        }
        if (processingTime) systemMetrics.processingTime.observe(processingTime);
        if (errorRate) systemMetrics.errorRate.set(errorRate);

        logger.debug('Обновлены системные метрики');
    } catch (error) {
        logger.error('Ошибка при обновлении системных метрик:', error);
        throw error;
    }
};

const getMetrics = async () => {
    try {
        return await register.metrics();
    } catch (error) {
        logger.error('Ошибка при получении метрик:', error);
        throw error;
    }
};

const resetMetrics = async () => {
    try {
        register.clear();
        logger.info('Метрики сброшены');
    } catch (error) {
        logger.error('Ошибка при сбросе метрик:', error);
        throw error;
    }
};

const getMetricsAsJson = async () => {
    try {
        const metrics = await register.getMetricsAsJSON();
        return metrics;
    } catch (error) {
        logger.error('Ошибка при получении метрик в формате JSON:', error);
        throw error;
    }
};

module.exports = {
    updateCampaignMetrics,
    updateSenderMetrics,
    updateSystemMetrics,
    getMetrics,
    resetMetrics,
    getMetricsAsJson
}; 
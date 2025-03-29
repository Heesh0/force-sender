const client = require('prom-client');
const { getConfig } = require('./configUtils');
const logger = require('./logger');
const os = require('os');
const { logInfo, logError } = require('./logger');
const { sequelize } = require('../models');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

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

// Кэш для хранения метрик
const metricsCache = new Map();
const CACHE_TTL = 60000; // 1 минута

// Получение метрик системы
const getSystemMetrics = async () => {
    try {
        const metrics = {
            uptime: os.uptime(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            loadAverage: os.loadavg(),
            cpuUsage: await getCPUUsage(),
            networkInterfaces: os.networkInterfaces(),
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname()
        };

        logInfo('Получены системные метрики:', metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения системных метрик:', error);
        throw error;
    }
};

// Получение использования CPU
const getCPUUsage = async () => {
    try {
        const { stdout } = await exec('top -bn1 | grep "Cpu(s)"');
        const cpuUsage = parseFloat(stdout.split('%')[0].split(' ').pop());
        return cpuUsage;
    } catch (error) {
        logError('Ошибка получения использования CPU:', error);
        return 0;
    }
};

// Получение метрик производительности
const getPerformanceMetrics = async () => {
    try {
        const metrics = {
            responseTime: await getResponseTimeMetrics(),
            throughput: await getThroughputMetrics(),
            errorRate: await getErrorRateMetrics(),
            resourceUsage: await getResourceUsageMetrics()
        };

        logInfo('Получены метрики производительности:', metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик производительности:', error);
        throw error;
    }
};

// Получение метрик времени отклика
const getResponseTimeMetrics = async () => {
    const cacheKey = 'responseTime';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            average: 0,
            p95: 0,
            p99: 0,
            max: 0
        };

        // Здесь будет логика получения метрик времени отклика
        // Например, из базы данных или системы мониторинга

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик времени отклика:', error);
        throw error;
    }
};

// Получение метрик пропускной способности
const getThroughputMetrics = async () => {
    const cacheKey = 'throughput';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            requestsPerSecond: 0,
            bytesPerSecond: 0,
            activeConnections: 0
        };

        // Здесь будет логика получения метрик пропускной способности

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик пропускной способности:', error);
        throw error;
    }
};

// Получение метрик ошибок
const getErrorRateMetrics = async () => {
    const cacheKey = 'errorRate';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            total: 0,
            rate: 0,
            byType: {}
        };

        // Здесь будет логика получения метрик ошибок

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик ошибок:', error);
        throw error;
    }
};

// Получение метрик использования ресурсов
const getResourceUsageMetrics = async () => {
    const cacheKey = 'resourceUsage';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            cpu: await getCPUUsage(),
            memory: {
                total: os.totalmem(),
                used: os.totalmem() - os.freemem(),
                free: os.freemem()
            },
            disk: await getDiskUsage(),
            network: await getNetworkUsage()
        };

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик использования ресурсов:', error);
        throw error;
    }
};

// Получение использования диска
const getDiskUsage = async () => {
    try {
        const { stdout } = await exec('df -h /');
        const lines = stdout.split('\n');
        const diskInfo = lines[1].split(/\s+/);
        return {
            total: diskInfo[1],
            used: diskInfo[2],
            free: diskInfo[3],
            usage: diskInfo[4]
        };
    } catch (error) {
        logError('Ошибка получения использования диска:', error);
        return {
            total: 0,
            used: 0,
            free: 0,
            usage: '0%'
        };
    }
};

// Получение использования сети
const getNetworkUsage = async () => {
    try {
        const { stdout } = await exec('netstat -i');
        const lines = stdout.split('\n');
        const networkInfo = lines[2].split(/\s+/);
        return {
            received: networkInfo[3],
            sent: networkInfo[7],
            errors: networkInfo[4]
        };
    } catch (error) {
        logError('Ошибка получения использования сети:', error);
        return {
            received: 0,
            sent: 0,
            errors: 0
        };
    }
};

// Получение метрик базы данных
const getDatabaseMetrics = async () => {
    try {
        const metrics = {
            connections: await sequelize.connectionManager.getConnection(),
            queries: await getQueryMetrics(),
            slowQueries: await getSlowQueryMetrics(),
            errors: await getDatabaseErrorMetrics(),
            replicationLag: await getReplicationLagMetrics()
        };

        logInfo('Получены метрики базы данных:', metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик базы данных:', error);
        throw error;
    }
};

// Получение метрик запросов
const getQueryMetrics = async () => {
    const cacheKey = 'queryMetrics';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            total: 0,
            averageTime: 0,
            slowQueries: 0
        };

        // Здесь будет логика получения метрик запросов

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик запросов:', error);
        throw error;
    }
};

// Получение метрик медленных запросов
const getSlowQueryMetrics = async () => {
    const cacheKey = 'slowQueryMetrics';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            count: 0,
            averageTime: 0,
            queries: []
        };

        // Здесь будет логика получения метрик медленных запросов

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик медленных запросов:', error);
        throw error;
    }
};

// Получение метрик ошибок базы данных
const getDatabaseErrorMetrics = async () => {
    const cacheKey = 'databaseErrorMetrics';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            total: 0,
            byType: {},
            recent: []
        };

        // Здесь будет логика получения метрик ошибок базы данных

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик ошибок базы данных:', error);
        throw error;
    }
};

// Получение метрик отставания репликации
const getReplicationLagMetrics = async () => {
    const cacheKey = 'replicationLagMetrics';
    if (metricsCache.has(cacheKey)) {
        return metricsCache.get(cacheKey);
    }

    try {
        const metrics = {
            lag: 0,
            status: 'ok'
        };

        // Здесь будет логика получения метрик отставания репликации

        metricsCache.set(cacheKey, metrics);
        return metrics;
    } catch (error) {
        logError('Ошибка получения метрик отставания репликации:', error);
        throw error;
    }
};

module.exports = {
    updateCampaignMetrics,
    updateSenderMetrics,
    updateSystemMetrics,
    getMetrics,
    resetMetrics,
    getMetricsAsJson,
    getSystemMetrics,
    getPerformanceMetrics,
    getDatabaseMetrics
}; 
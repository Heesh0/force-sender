const express = require('express');
const router = express.Router();
const { logInfo, logError } = require('../utils/logger');
const auth = require('../middleware/auth');
const { getQueueEvents } = require('../utils/queueUtils');
const { getMetrics } = require('../utils/metricsUtils');

// Получение метрик очереди
router.get('/queue', auth, async (req, res) => {
    try {
        const queueEvents = getQueueEvents();
        const metrics = {
            activeJobs: await queueEvents.getActiveCount(),
            waitingJobs: await queueEvents.getWaitingCount(),
            completedJobs: await queueEvents.getCompletedCount(),
            failedJobs: await queueEvents.getFailedCount(),
            delayedJobs: await queueEvents.getDelayedCount(),
            processingTime: await queueEvents.getAverageProcessingTime(),
            throughput: await queueEvents.getThroughput()
        };

        logInfo('Получены метрики очереди:', {
            userId: req.user.id,
            metrics
        });

        res.json({ metrics });
    } catch (error) {
        logError('Ошибка получения метрик очереди:', error);
        res.status(500).json({
            error: 'Ошибка при получении метрик очереди'
        });
    }
});

// Получение метрик системы
router.get('/system', auth, async (req, res) => {
    try {
        const metrics = await getMetrics();
        
        logInfo('Получены системные метрики:', {
            userId: req.user.id,
            metrics
        });

        res.json({ metrics });
    } catch (error) {
        logError('Ошибка получения системных метрик:', error);
        res.status(500).json({
            error: 'Ошибка при получении системных метрик'
        });
    }
});

// Получение метрик производительности
router.get('/performance', auth, async (req, res) => {
    try {
        const metrics = {
            responseTime: await getMetrics('responseTime'),
            throughput: await getMetrics('throughput'),
            errorRate: await getMetrics('errorRate'),
            cpuUsage: await getMetrics('cpuUsage'),
            memoryUsage: await getMetrics('memoryUsage'),
            diskUsage: await getMetrics('diskUsage'),
            networkUsage: await getMetrics('networkUsage')
        };

        logInfo('Получены метрики производительности:', {
            userId: req.user.id,
            metrics
        });

        res.json({ metrics });
    } catch (error) {
        logError('Ошибка получения метрик производительности:', error);
        res.status(500).json({
            error: 'Ошибка при получении метрик производительности'
        });
    }
});

// Получение метрик безопасности
router.get('/security', auth, async (req, res) => {
    try {
        const metrics = {
            failedLogins: await getMetrics('failedLogins'),
            blockedIPs: await getMetrics('blockedIPs'),
            suspiciousActivities: await getMetrics('suspiciousActivities'),
            securityIncidents: await getMetrics('securityIncidents'),
            rateLimitViolations: await getMetrics('rateLimitViolations')
        };

        logInfo('Получены метрики безопасности:', {
            userId: req.user.id,
            metrics
        });

        res.json({ metrics });
    } catch (error) {
        logError('Ошибка получения метрик безопасности:', error);
        res.status(500).json({
            error: 'Ошибка при получении метрик безопасности'
        });
    }
});

// Получение метрик базы данных
router.get('/database', auth, async (req, res) => {
    try {
        const metrics = {
            connections: await getMetrics('dbConnections'),
            queries: await getMetrics('dbQueries'),
            slowQueries: await getMetrics('dbSlowQueries'),
            errors: await getMetrics('dbErrors'),
            replicationLag: await getMetrics('dbReplicationLag')
        };

        logInfo('Получены метрики базы данных:', {
            userId: req.user.id,
            metrics
        });

        res.json({ metrics });
    } catch (error) {
        logError('Ошибка получения метрик базы данных:', error);
        res.status(500).json({
            error: 'Ошибка при получении метрик базы данных'
        });
    }
});

module.exports = router; 
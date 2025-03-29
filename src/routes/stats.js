const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Recipient = require('../models/Recipient');
const { logInfo, logError } = require('../utils/logger');
const auth = require('../middleware/auth');

// Получение общей статистики
router.get('/', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            where: { userId: req.user.id }
        });

        const stats = {
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter(c => c.status === 'running').length,
            totalRecipients: campaigns.reduce((sum, c) => sum + c.totalRecipients, 0),
            totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
            totalFailed: campaigns.reduce((sum, c) => sum + c.failedCount, 0),
            totalBounced: campaigns.reduce((sum, c) => sum + c.bounceCount, 0),
            totalUnsubscribed: campaigns.reduce((sum, c) => sum + c.unsubscribeCount, 0),
            averageOpenRate: campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length || 0,
            averageClickRate: campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length || 0,
            averageSpamScore: campaigns.reduce((sum, c) => sum + c.spamScore, 0) / campaigns.length || 0
        };

        logInfo('Получена общая статистика:', {
            userId: req.user.id,
            stats
        });

        res.json({ stats });
    } catch (error) {
        logError('Ошибка получения общей статистики:', error);
        res.status(500).json({
            error: 'Ошибка при получении общей статистики'
        });
    }
});

// Получение статистики по кампаниям
router.get('/campaigns', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        const stats = campaigns.map(campaign => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            totalRecipients: campaign.totalRecipients,
            sentCount: campaign.sentCount,
            failedCount: campaign.failedCount,
            bounceCount: campaign.bounceCount,
            unsubscribeCount: campaign.unsubscribeCount,
            openRate: campaign.openRate,
            clickRate: campaign.clickRate,
            spamScore: campaign.spamScore,
            startDate: campaign.startDate,
            endDate: campaign.endDate
        }));

        logInfo('Получена статистика по кампаниям:', {
            userId: req.user.id,
            count: campaigns.length
        });

        res.json({ stats });
    } catch (error) {
        logError('Ошибка получения статистики по кампаниям:', error);
        res.status(500).json({
            error: 'Ошибка при получении статистики по кампаниям'
        });
    }
});

// Получение статистики по получателям
router.get('/recipients', auth, async (req, res) => {
    try {
        const recipients = await Recipient.findAll({
            include: [{
                model: Campaign,
                where: { userId: req.user.id }
            }]
        });

        const stats = {
            total: recipients.length,
            byStatus: {
                pending: recipients.filter(r => r.status === 'pending').length,
                sent: recipients.filter(r => r.status === 'sent').length,
                delivered: recipients.filter(r => r.status === 'delivered').length,
                opened: recipients.filter(r => r.status === 'opened').length,
                clicked: recipients.filter(r => r.status === 'clicked').length,
                bounced: recipients.filter(r => r.status === 'bounced').length,
                unsubscribed: recipients.filter(r => r.status === 'unsubscribed').length,
                spam: recipients.filter(r => r.status === 'spam').length,
                failed: recipients.filter(r => r.status === 'failed').length
            }
        };

        logInfo('Получена статистика по получателям:', {
            userId: req.user.id,
            stats
        });

        res.json({ stats });
    } catch (error) {
        logError('Ошибка получения статистики по получателям:', error);
        res.status(500).json({
            error: 'Ошибка при получении статистики по получателям'
        });
    }
});

// Получение статистики по отправителям
router.get('/senders', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            where: { userId: req.user.id },
            include: ['Sender']
        });

        const senderStats = new Map();

        campaigns.forEach(campaign => {
            const sender = campaign.Sender;
            if (!sender) return;

            const stats = senderStats.get(sender.id) || {
                id: sender.id,
                name: sender.name,
                email: sender.email,
                totalCampaigns: 0,
                totalRecipients: 0,
                totalSent: 0,
                totalFailed: 0,
                totalBounced: 0,
                averageOpenRate: 0,
                averageClickRate: 0,
                averageSpamScore: 0
            };

            stats.totalCampaigns++;
            stats.totalRecipients += campaign.totalRecipients;
            stats.totalSent += campaign.sentCount;
            stats.totalFailed += campaign.failedCount;
            stats.totalBounced += campaign.bounceCount;
            stats.averageOpenRate += campaign.openRate;
            stats.averageClickRate += campaign.clickRate;
            stats.averageSpamScore += campaign.spamScore;

            senderStats.set(sender.id, stats);
        });

        // Вычисляем средние значения
        senderStats.forEach(stats => {
            stats.averageOpenRate /= stats.totalCampaigns;
            stats.averageClickRate /= stats.totalCampaigns;
            stats.averageSpamScore /= stats.totalCampaigns;
        });

        logInfo('Получена статистика по отправителям:', {
            userId: req.user.id,
            count: senderStats.size
        });

        res.json({
            stats: Array.from(senderStats.values())
        });
    } catch (error) {
        logError('Ошибка получения статистики по отправителям:', error);
        res.status(500).json({
            error: 'Ошибка при получении статистики по отправителям'
        });
    }
});

// Получение статистики по времени
router.get('/timeline', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Необходимо указать начальную и конечную даты'
            });
        }

        const campaigns = await Campaign.findAll({
            where: {
                userId: req.user.id,
                startDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['startDate', 'ASC']]
        });

        const timeline = campaigns.map(campaign => ({
            date: campaign.startDate,
            stats: {
                totalRecipients: campaign.totalRecipients,
                sentCount: campaign.sentCount,
                failedCount: campaign.failedCount,
                bounceCount: campaign.bounceCount,
                unsubscribeCount: campaign.unsubscribeCount,
                openRate: campaign.openRate,
                clickRate: campaign.clickRate,
                spamScore: campaign.spamScore
            }
        }));

        logInfo('Получена статистика по времени:', {
            userId: req.user.id,
            startDate,
            endDate,
            count: campaigns.length
        });

        res.json({ timeline });
    } catch (error) {
        logError('Ошибка получения статистики по времени:', error);
        res.status(500).json({
            error: 'Ошибка при получении статистики по времени'
        });
    }
});

module.exports = router; 
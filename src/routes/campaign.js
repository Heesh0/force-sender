const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validator');
const Campaign = require('../models/Campaign');
const Sender = require('../models/Sender');
const { logInfo, logError } = require('../utils/logger');
const auth = require('../middleware/auth');

// Валидация входных данных
const campaignValidation = [
    body('name').notEmpty().withMessage('Название обязательно'),
    body('senderId').isInt().withMessage('Некорректный ID отправителя'),
    body('subject').notEmpty().withMessage('Тема письма обязательна'),
    body('content').notEmpty().withMessage('Содержание письма обязательно'),
    body('schedule').optional().isObject().withMessage('Некорректный формат расписания'),
    body('startDate').optional().isISO8601().withMessage('Некорректная дата начала'),
    body('endDate').optional().isISO8601().withMessage('Некорректная дата окончания')
];

// Получение списка кампаний
router.get('/', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.findByUserId(req.user.id);
        res.json({ campaigns });
    } catch (error) {
        logError('Ошибка получения списка кампаний:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка кампаний'
        });
    }
});

// Получение кампании по ID
router.get('/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        res.json({ campaign });
    } catch (error) {
        logError('Ошибка получения кампании:', error);
        res.status(500).json({
            error: 'Ошибка при получении кампании'
        });
    }
});

// Создание кампании
router.post('/', auth, campaignValidation, validateRequest, async (req, res) => {
    try {
        // Проверяем существование отправителя
        const sender = await Sender.findOne({
            where: {
                id: req.body.senderId,
                userId: req.user.id
            }
        });

        if (!sender) {
            return res.status(404).json({
                error: 'Отправитель не найден'
            });
        }

        const campaign = await Campaign.create({
            ...req.body,
            userId: req.user.id
        });

        logInfo('Создана новая кампания:', {
            campaignId: campaign.id,
            userId: req.user.id
        });

        res.status(201).json({
            message: 'Кампания успешно создана',
            campaign
        });
    } catch (error) {
        logError('Ошибка создания кампании:', error);
        res.status(500).json({
            error: 'Ошибка при создании кампании'
        });
    }
});

// Обновление кампании
router.put('/:id', auth, campaignValidation, validateRequest, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        // Проверяем существование отправителя
        if (req.body.senderId) {
            const sender = await Sender.findOne({
                where: {
                    id: req.body.senderId,
                    userId: req.user.id
                }
            });

            if (!sender) {
                return res.status(404).json({
                    error: 'Отправитель не найден'
                });
            }
        }

        await campaign.update(req.body);

        logInfo('Кампания обновлена:', {
            campaignId: campaign.id,
            userId: req.user.id
        });

        res.json({
            message: 'Кампания успешно обновлена',
            campaign
        });
    } catch (error) {
        logError('Ошибка обновления кампании:', error);
        res.status(500).json({
            error: 'Ошибка при обновлении кампании'
        });
    }
});

// Удаление кампании
router.delete('/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        await campaign.destroy();

        logInfo('Кампания удалена:', {
            campaignId: req.params.id,
            userId: req.user.id
        });

        res.json({
            message: 'Кампания успешно удалена'
        });
    } catch (error) {
        logError('Ошибка удаления кампании:', error);
        res.status(500).json({
            error: 'Ошибка при удалении кампании'
        });
    }
});

// Запуск кампании
router.post('/:id/start', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
            return res.status(400).json({
                error: 'Кампания не может быть запущена'
            });
        }

        campaign.status = 'running';
        campaign.startDate = new Date();
        await campaign.save();

        // TODO: Добавить логику запуска кампании

        logInfo('Кампания запущена:', {
            campaignId: campaign.id,
            userId: req.user.id
        });

        res.json({
            message: 'Кампания успешно запущена',
            campaign
        });
    } catch (error) {
        logError('Ошибка запуска кампании:', error);
        res.status(500).json({
            error: 'Ошибка при запуске кампании'
        });
    }
});

// Остановка кампании
router.post('/:id/stop', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        if (campaign.status !== 'running') {
            return res.status(400).json({
                error: 'Кампания не может быть остановлена'
            });
        }

        campaign.status = 'cancelled';
        campaign.endDate = new Date();
        await campaign.save();

        // TODO: Добавить логику остановки кампании

        logInfo('Кампания остановлена:', {
            campaignId: campaign.id,
            userId: req.user.id
        });

        res.json({
            message: 'Кампания успешно остановлена',
            campaign
        });
    } catch (error) {
        logError('Ошибка остановки кампании:', error);
        res.status(500).json({
            error: 'Ошибка при остановке кампании'
        });
    }
});

// Получение статистики кампании
router.get('/:id/stats', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        // TODO: Добавить логику получения статистики

        res.json({
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
        });
    } catch (error) {
        logError('Ошибка получения статистики кампании:', error);
        res.status(500).json({
            error: 'Ошибка при получении статистики кампании'
        });
    }
});

module.exports = router; 
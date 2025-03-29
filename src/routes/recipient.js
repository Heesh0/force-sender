const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validator');
const Recipient = require('../models/Recipient');
const Campaign = require('../models/Campaign');
const { logInfo, logError } = require('../utils/logger');
const auth = require('../middleware/auth');

// Валидация входных данных
const recipientValidation = [
    body('email').isEmail().withMessage('Некорректный email'),
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('metadata').optional().isObject()
];

// Получение списка получателей кампании
router.get('/campaign/:campaignId', auth, async (req, res) => {
    try {
        // Проверяем существование кампании
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.campaignId,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        const recipients = await Recipient.findByCampaign(req.params.campaignId);
        res.json({ recipients });
    } catch (error) {
        logError('Ошибка получения списка получателей:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка получателей'
        });
    }
});

// Добавление получателей в кампанию
router.post('/campaign/:campaignId/batch', auth, async (req, res) => {
    try {
        // Проверяем существование кампании
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.campaignId,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        const { recipients } = req.body;
        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                error: 'Список получателей обязателен'
            });
        }

        // Валидируем каждого получателя
        for (const recipient of recipients) {
            const { error } = validateRequest({
                body: recipient,
                validation: recipientValidation
            });
            if (error) {
                return res.status(400).json({
                    error: 'Некорректные данные получателя',
                    details: error
                });
            }
        }

        // Создаем получателей
        const createdRecipients = await Promise.all(
            recipients.map(recipient =>
                Recipient.create({
                    ...recipient,
                    campaignId: req.params.campaignId
                })
            )
        );

        // Обновляем количество получателей в кампании
        campaign.totalRecipients += createdRecipients.length;
        await campaign.save();

        logInfo('Получатели добавлены в кампанию:', {
            campaignId: req.params.campaignId,
            count: createdRecipients.length
        });

        res.status(201).json({
            message: 'Получатели успешно добавлены',
            recipients: createdRecipients
        });
    } catch (error) {
        logError('Ошибка добавления получателей:', error);
        res.status(500).json({
            error: 'Ошибка при добавлении получателей'
        });
    }
});

// Импорт получателей из CSV
router.post('/campaign/:campaignId/import', auth, async (req, res) => {
    try {
        // Проверяем существование кампании
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.campaignId,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: 'CSV файл обязателен'
            });
        }

        // TODO: Добавить логику импорта из CSV

        logInfo('Начат импорт получателей:', {
            campaignId: req.params.campaignId,
            filename: req.file.originalname
        });

        res.json({
            message: 'Импорт получателей начат'
        });
    } catch (error) {
        logError('Ошибка импорта получателей:', error);
        res.status(500).json({
            error: 'Ошибка при импорте получателей'
        });
    }
});

// Экспорт получателей в CSV
router.get('/campaign/:campaignId/export', auth, async (req, res) => {
    try {
        // Проверяем существование кампании
        const campaign = await Campaign.findOne({
            where: {
                id: req.params.campaignId,
                userId: req.user.id
            }
        });

        if (!campaign) {
            return res.status(404).json({
                error: 'Кампания не найдена'
            });
        }

        // TODO: Добавить логику экспорта в CSV

        logInfo('Начат экспорт получателей:', {
            campaignId: req.params.campaignId
        });

        res.json({
            message: 'Экспорт получателей начат'
        });
    } catch (error) {
        logError('Ошибка экспорта получателей:', error);
        res.status(500).json({
            error: 'Ошибка при экспорте получателей'
        });
    }
});

// Удаление получателя
router.delete('/:id', auth, async (req, res) => {
    try {
        const recipient = await Recipient.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: Campaign,
                where: {
                    userId: req.user.id
                }
            }]
        });

        if (!recipient) {
            return res.status(404).json({
                error: 'Получатель не найден'
            });
        }

        await recipient.destroy();

        // Обновляем количество получателей в кампании
        const campaign = recipient.Campaign;
        campaign.totalRecipients--;
        await campaign.save();

        logInfo('Получатель удален:', {
            recipientId: req.params.id,
            campaignId: campaign.id
        });

        res.json({
            message: 'Получатель успешно удален'
        });
    } catch (error) {
        logError('Ошибка удаления получателя:', error);
        res.status(500).json({
            error: 'Ошибка при удалении получателя'
        });
    }
});

// Обновление статуса получателя
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                error: 'Статус обязателен'
            });
        }

        const recipient = await Recipient.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: Campaign,
                where: {
                    userId: req.user.id
                }
            }]
        });

        if (!recipient) {
            return res.status(404).json({
                error: 'Получатель не найден'
            });
        }

        await recipient.updateStatus(status);

        res.json({
            message: 'Статус получателя успешно обновлен',
            recipient
        });
    } catch (error) {
        logError('Ошибка обновления статуса получателя:', error);
        res.status(500).json({
            error: 'Ошибка при обновлении статуса получателя'
        });
    }
});

module.exports = router; 
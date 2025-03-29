const { Campaign, Domain, Recipient } = require('../models');
const rusenderService = require('../services/rusenderService');
const { logger } = require('../utils/logger');

const campaignController = {
    // Получение списка кампаний
    async getCampaigns(req, res) {
        try {
            const campaigns = await Campaign.findAll({
                include: [
                    { model: Domain, attributes: ['name', 'senderEmail'] },
                    {
                        model: Recipient,
                        attributes: ['id', 'email', 'status'],
                        where: { status: 'sent' },
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json(campaigns);
        } catch (error) {
            logger.error('Error fetching campaigns:', error);
            res.status(500).json({ error: 'Ошибка при получении списка кампаний' });
        }
    },

    // Создание новой кампании
    async createCampaign(req, res) {
        try {
            const { name, domainId, subject, previewTitle, templateId, templateParams, senderName } = req.body;

            const domain = await Domain.findByPk(domainId);
            if (!domain) {
                return res.status(404).json({ error: 'Домен не найден' });
            }

            const campaign = await Campaign.create({
                name,
                domainId,
                subject,
                previewTitle,
                templateId,
                templateParams,
                senderName,
                status: 'draft',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 дней
            });

            res.status(201).json(campaign);
        } catch (error) {
            logger.error('Error creating campaign:', error);
            res.status(500).json({ error: 'Ошибка при создании кампании' });
        }
    },

    // Запуск кампании
    async startCampaign(req, res) {
        try {
            const { id } = req.params;
            const campaign = await Campaign.findByPk(id, {
                include: [
                    { model: Domain },
                    { model: Recipient, where: { status: 'pending' } }
                ]
            });

            if (!campaign) {
                return res.status(404).json({ error: 'Кампания не найдена' });
            }

            if (campaign.status !== 'draft') {
                return res.status(400).json({ error: 'Кампания уже запущена или завершена' });
            }

            // Обновляем статус кампании
            campaign.status = 'running';
            await campaign.save();

            // Отправляем письма получателям
            for (const recipient of campaign.Recipients) {
                try {
                    await rusenderService.sendEmail(campaign.Domain, recipient, campaign);
                    recipient.status = 'sent';
                    await recipient.save();
                    campaign.sentEmails += 1;
                    await campaign.save();
                } catch (error) {
                    recipient.status = 'failed';
                    await recipient.save();
                    campaign.failedEmails += 1;
                    await campaign.save();
                    logger.error(`Failed to send email to ${recipient.email}:`, error);
                }
            }

            // Проверяем, все ли письма отправлены
            if (campaign.sentEmails + campaign.failedEmails === campaign.totalEmails) {
                campaign.status = 'completed';
                await campaign.save();
            }

            res.json(campaign);
        } catch (error) {
            logger.error('Error starting campaign:', error);
            res.status(500).json({ error: 'Ошибка при запуске кампании' });
        }
    },

    // Остановка кампании
    async stopCampaign(req, res) {
        try {
            const { id } = req.params;
            const campaign = await Campaign.findByPk(id);

            if (!campaign) {
                return res.status(404).json({ error: 'Кампания не найдена' });
            }

            if (campaign.status !== 'running') {
                return res.status(400).json({ error: 'Кампания не запущена' });
            }

            campaign.status = 'paused';
            await campaign.save();

            res.json(campaign);
        } catch (error) {
            logger.error('Error stopping campaign:', error);
            res.status(500).json({ error: 'Ошибка при остановке кампании' });
        }
    },

    // Удаление кампании
    async deleteCampaign(req, res) {
        try {
            const { id } = req.params;
            const campaign = await Campaign.findByPk(id);

            if (!campaign) {
                return res.status(404).json({ error: 'Кампания не найдена' });
            }

            await campaign.destroy();
            res.json({ message: 'Кампания успешно удалена' });
        } catch (error) {
            logger.error('Error deleting campaign:', error);
            res.status(500).json({ error: 'Ошибка при удалении кампании' });
        }
    },

    // Получение статистики кампании
    async getCampaignStats(req, res) {
        try {
            const { id } = req.params;
            const campaign = await Campaign.findByPk(id, {
                include: [
                    {
                        model: Recipient,
                        attributes: ['status'],
                        required: false
                    }
                ]
            });

            if (!campaign) {
                return res.status(404).json({ error: 'Кампания не найдена' });
            }

            const stats = {
                total: campaign.Recipients.length,
                sent: campaign.Recipients.filter(r => r.status === 'sent').length,
                failed: campaign.Recipients.filter(r => r.status === 'failed').length,
                pending: campaign.Recipients.filter(r => r.status === 'pending').length,
                openRate: campaign.openRate,
                clickRate: campaign.clickRate
            };

            res.json(stats);
        } catch (error) {
            logger.error('Error fetching campaign stats:', error);
            res.status(500).json({ error: 'Ошибка при получении статистики кампании' });
        }
    }
};

module.exports = campaignController; 
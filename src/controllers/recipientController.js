const { Recipient, Campaign } = require('../models');
const { logger } = require('../utils/logger');
const csv = require('csv-parse');
const fs = require('fs');

const recipientController = {
    // Получение списка получателей
    async getRecipients(req, res) {
        try {
            const { campaignId } = req.query;
            const where = campaignId ? { campaignId } : {};

            const recipients = await Recipient.findAll({
                where,
                include: [
                    {
                        model: Campaign,
                        attributes: ['name']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json(recipients);
        } catch (error) {
            logger.error('Error fetching recipients:', error);
            res.status(500).json({ error: 'Ошибка при получении списка получателей' });
        }
    },

    // Создание нового получателя
    async createRecipient(req, res) {
        try {
            const { email, name, campaignId } = req.body;

            // Проверяем существование кампании
            const campaign = await Campaign.findByPk(campaignId);
            if (!campaign) {
                return res.status(404).json({ error: 'Кампания не найдена' });
            }

            // Проверяем, не существует ли уже получатель с таким email в этой кампании
            const existingRecipient = await Recipient.findOne({
                where: { email, campaignId }
            });

            if (existingRecipient) {
                return res.status(400).json({ error: 'Получатель с таким email уже существует в этой кампании' });
            }

            const recipient = await Recipient.create({
                email,
                name,
                campaignId,
                status: 'pending'
            });

            // Обновляем общее количество получателей в кампании
            campaign.totalEmails += 1;
            await campaign.save();

            res.status(201).json(recipient);
        } catch (error) {
            logger.error('Error creating recipient:', error);
            res.status(500).json({ error: 'Ошибка при создании получателя' });
        }
    },

    // Загрузка получателей из CSV
    async uploadRecipients(req, res) {
        try {
            const { campaignId } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'Файл не был загружен' });
            }

            // Проверяем существование кампании
            const campaign = await Campaign.findByPk(campaignId);
            if (!campaign) {
                return res.status(404).json({ error: 'Кампания не найдена' });
            }

            const recipients = [];
            let totalAdded = 0;
            let totalSkipped = 0;

            // Читаем CSV файл
            fs.createReadStream(file.path)
                .pipe(csv.parse({ columns: true, skip_empty_lines: true }))
                .on('data', async (row) => {
                    try {
                        const { email, name } = row;

                        // Проверяем, не существует ли уже получатель
                        const existingRecipient = await Recipient.findOne({
                            where: { email, campaignId }
                        });

                        if (!existingRecipient) {
                            await Recipient.create({
                                email,
                                name,
                                campaignId,
                                status: 'pending'
                            });
                            totalAdded++;
                        } else {
                            totalSkipped++;
                        }
                    } catch (error) {
                        logger.error('Error processing CSV row:', error);
                    }
                })
                .on('end', async () => {
                    // Обновляем общее количество получателей в кампании
                    campaign.totalEmails += totalAdded;
                    await campaign.save();

                    // Удаляем временный файл
                    fs.unlinkSync(file.path);

                    res.json({
                        message: 'Загрузка завершена',
                        totalAdded,
                        totalSkipped
                    });
                })
                .on('error', (error) => {
                    logger.error('Error processing CSV file:', error);
                    res.status(500).json({ error: 'Ошибка при обработке CSV файла' });
                });
        } catch (error) {
            logger.error('Error uploading recipients:', error);
            res.status(500).json({ error: 'Ошибка при загрузке получателей' });
        }
    },

    // Обновление получателя
    async updateRecipient(req, res) {
        try {
            const { id } = req.params;
            const { email, name, status } = req.body;

            const recipient = await Recipient.findByPk(id);
            if (!recipient) {
                return res.status(404).json({ error: 'Получатель не найден' });
            }

            await recipient.update({
                email,
                name,
                status
            });

            res.json(recipient);
        } catch (error) {
            logger.error('Error updating recipient:', error);
            res.status(500).json({ error: 'Ошибка при обновлении получателя' });
        }
    },

    // Удаление получателя
    async deleteRecipient(req, res) {
        try {
            const { id } = req.params;
            const recipient = await Recipient.findByPk(id);

            if (!recipient) {
                return res.status(404).json({ error: 'Получатель не найден' });
            }

            const campaign = await Campaign.findByPk(recipient.campaignId);
            if (campaign) {
                campaign.totalEmails -= 1;
                await campaign.save();
            }

            await recipient.destroy();
            res.json({ message: 'Получатель успешно удален' });
        } catch (error) {
            logger.error('Error deleting recipient:', error);
            res.status(500).json({ error: 'Ошибка при удалении получателя' });
        }
    }
};

module.exports = recipientController; 
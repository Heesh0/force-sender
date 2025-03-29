const { Domain } = require('../models');
const rusenderService = require('../services/rusenderService');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

const domainController = {
    // Получение списка доменов
    async getDomains(req, res) {
        try {
            const domains = await Domain.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.json(domains);
        } catch (error) {
            logger.error('Error fetching domains:', error);
            res.status(500).json({ error: 'Ошибка при получении списка доменов' });
        }
    },

    // Создание нового домена
    async createDomain(req, res) {
        try {
            const { name, apiKey, senderEmail } = req.body;

            // Проверяем, не существует ли уже домен с таким именем
            const existingDomain = await Domain.findOne({ where: { name } });
            if (existingDomain) {
                return res.status(400).json({ error: 'Домен с таким именем уже существует' });
            }

            const domain = await Domain.create({
                name,
                apiKey,
                senderEmail,
                status: 'active'
            });

            res.status(201).json(domain);
        } catch (error) {
            logger.error('Error creating domain:', error);
            res.status(500).json({ error: 'Ошибка при создании домена' });
        }
    },

    // Верификация домена
    async verifyDomain(req, res) {
        try {
            const { id } = req.params;
            const domain = await Domain.findByPk(id);

            if (!domain) {
                return res.status(404).json({ error: 'Домен не найден' });
            }

            const verificationResult = await rusenderService.verifyDomain(domain);
            
            if (verificationResult.success) {
                domain.verified = true;
                await domain.save();
                res.json({ message: 'Домен успешно верифицирован' });
            } else {
                res.status(400).json({ error: 'Ошибка при верификации домена' });
            }
        } catch (error) {
            logger.error('Error verifying domain:', error);
            res.status(500).json({ error: 'Ошибка при верификации домена' });
        }
    },

    // Получение шаблонов для домена
    async getTemplates(req, res) {
        try {
            const { id } = req.params;
            const domain = await Domain.findByPk(id);

            if (!domain) {
                return res.status(404).json({ error: 'Домен не найден' });
            }

            const templates = await rusenderService.getTemplates(domain);
            res.json(templates);
        } catch (error) {
            logger.error('Error fetching templates:', error);
            res.status(500).json({ error: 'Ошибка при получении шаблонов' });
        }
    },

    // Получение деталей шаблона
    async getTemplateDetails(req, res) {
        try {
            const { id, templateId } = req.params;
            const domain = await Domain.findByPk(id);

            if (!domain) {
                return res.status(404).json({ error: 'Домен не найден' });
            }

            const templateDetails = await rusenderService.getTemplateDetails(domain, templateId);
            res.json(templateDetails);
        } catch (error) {
            logger.error('Error fetching template details:', error);
            res.status(500).json({ error: 'Ошибка при получении деталей шаблона' });
        }
    },

    // Обновление домена
    async updateDomain(req, res) {
        try {
            const { id } = req.params;
            const { apiKey, senderEmail, status } = req.body;

            const domain = await Domain.findByPk(id);
            if (!domain) {
                return res.status(404).json({ error: 'Домен не найден' });
            }

            await domain.update({
                apiKey,
                senderEmail,
                status
            });

            res.json(domain);
        } catch (error) {
            logger.error('Error updating domain:', error);
            res.status(500).json({ error: 'Ошибка при обновлении домена' });
        }
    },

    // Удаление домена
    async deleteDomain(req, res) {
        try {
            const { id } = req.params;
            const domain = await Domain.findByPk(id);

            if (!domain) {
                return res.status(404).json({ error: 'Домен не найден' });
            }

            await domain.destroy();
            res.json({ message: 'Домен успешно удален' });
        } catch (error) {
            logger.error('Error deleting domain:', error);
            res.status(500).json({ error: 'Ошибка при удалении домена' });
        }
    }
};

module.exports = domainController; 
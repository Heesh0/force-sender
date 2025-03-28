const { Domain } = require('../models');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class DomainController {
    async getAllDomains(req, res) {
        try {
            const domains = await Domain.findAll({
                where: { isActive: true }
            });
            res.json(domains);
        } catch (error) {
            logger.error('Error getting domains:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createDomain(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, senderEmail, mailFrom, apiKey, templateId } = req.body;

            const domain = await Domain.create({
                name,
                senderEmail,
                mailFrom,
                apiKey,
                templateId
            });

            logger.info(`Domain created: ${name}`);
            res.status(201).json(domain);
        } catch (error) {
            logger.error('Error creating domain:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateDomain(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const { name, senderEmail, mailFrom, apiKey, templateId } = req.body;

            const domain = await Domain.findByPk(id);
            if (!domain) {
                return res.status(404).json({ error: 'Domain not found' });
            }

            await domain.update({
                name,
                senderEmail,
                mailFrom,
                apiKey,
                templateId
            });

            logger.info(`Domain updated: ${name}`);
            res.json(domain);
        } catch (error) {
            logger.error('Error updating domain:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteDomain(req, res) {
        try {
            const { id } = req.params;

            const domain = await Domain.findByPk(id);
            if (!domain) {
                return res.status(404).json({ error: 'Domain not found' });
            }

            await domain.update({ isActive: false });
            logger.info(`Domain deleted: ${domain.name}`);
            res.json({ message: 'Domain deleted successfully' });
        } catch (error) {
            logger.error('Error deleting domain:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getDomainById(req, res) {
        try {
            const { id } = req.params;

            const domain = await Domain.findByPk(id);
            if (!domain) {
                return res.status(404).json({ error: 'Domain not found' });
            }

            res.json(domain);
        } catch (error) {
            logger.error('Error getting domain:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new DomainController(); 
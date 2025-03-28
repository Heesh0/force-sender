const { Mailing, Domain, Email } = require('../models');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const queueService = require('../services/queueService');
const rusenderService = require('../services/rusenderService');

class MailingController {
    async getAllMailings(req, res) {
        try {
            const mailings = await Mailing.findAll({
                include: [{
                    model: Domain,
                    attributes: ['name']
                }],
                order: [['createdAt', 'DESC']]
            });
            res.json(mailings);
        } catch (error) {
            logger.error('Error getting mailings:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createMailing(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                name,
                domainId,
                subject,
                previewTitle,
                templateId,
                totalEmails,
                startDate,
                endDate,
                isTest,
                testEmail,
                templateParams
            } = req.body;

            const domain = await Domain.findByPk(domainId);
            if (!domain) {
                return res.status(404).json({ error: 'Domain not found' });
            }

            const mailing = await Mailing.create({
                name,
                domainId,
                subject,
                previewTitle,
                templateId,
                totalEmails,
                startDate,
                endDate,
                isTest,
                testEmail,
                templateParams
            });

            if (isTest && testEmail) {
                const result = await rusenderService.sendTestEmail(
                    domain,
                    testEmail,
                    templateId,
                    subject,
                    previewTitle,
                    templateParams
                );

                if (!result.success) {
                    return res.status(400).json({ error: result.error });
                }
            } else {
                const emails = await Email.findAll({
                    where: {
                        domainId,
                        status: 'new'
                    },
                    limit: totalEmails
                });

                if (emails.length === 0) {
                    return res.status(400).json({ error: 'No available emails found' });
                }

                await queueService.scheduleMailing(mailing, emails);
            }

            logger.info(`Mailing created: ${name}`);
            res.status(201).json(mailing);
        } catch (error) {
            logger.error('Error creating mailing:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateMailing(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const updateData = req.body;

            const mailing = await Mailing.findByPk(id);
            if (!mailing) {
                return res.status(404).json({ error: 'Mailing not found' });
            }

            if (mailing.status === 'running') {
                return res.status(400).json({ error: 'Cannot update running mailing' });
            }

            await mailing.update(updateData);
            logger.info(`Mailing updated: ${mailing.name}`);
            res.json(mailing);
        } catch (error) {
            logger.error('Error updating mailing:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async pauseMailing(req, res) {
        try {
            const { id } = req.params;

            const mailing = await Mailing.findByPk(id);
            if (!mailing) {
                return res.status(404).json({ error: 'Mailing not found' });
            }

            if (mailing.status !== 'running') {
                return res.status(400).json({ error: 'Mailing is not running' });
            }

            await queueService.pauseMailing(id);
            res.json({ message: 'Mailing paused successfully' });
        } catch (error) {
            logger.error('Error pausing mailing:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async resumeMailing(req, res) {
        try {
            const { id } = req.params;

            const mailing = await Mailing.findByPk(id);
            if (!mailing) {
                return res.status(404).json({ error: 'Mailing not found' });
            }

            if (mailing.status !== 'paused') {
                return res.status(400).json({ error: 'Mailing is not paused' });
            }

            await queueService.resumeMailing(id);
            res.json({ message: 'Mailing resumed successfully' });
        } catch (error) {
            logger.error('Error resuming mailing:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async stopMailing(req, res) {
        try {
            const { id } = req.params;

            const mailing = await Mailing.findByPk(id);
            if (!mailing) {
                return res.status(404).json({ error: 'Mailing not found' });
            }

            if (mailing.status === 'completed' || mailing.status === 'failed') {
                return res.status(400).json({ error: 'Mailing is already finished' });
            }

            await queueService.stopMailing(id);
            res.json({ message: 'Mailing stopped successfully' });
        } catch (error) {
            logger.error('Error stopping mailing:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getMailingById(req, res) {
        try {
            const { id } = req.params;

            const mailing = await Mailing.findByPk(id, {
                include: [{
                    model: Domain,
                    attributes: ['name']
                }]
            });

            if (!mailing) {
                return res.status(404).json({ error: 'Mailing not found' });
            }

            res.json(mailing);
        } catch (error) {
            logger.error('Error getting mailing:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new MailingController(); 
const axios = require('axios');
const { logger } = require('../utils/logger');

class RuSenderService {
    constructor() {
        this.baseURL = 'https://api.beta.rusender.ru/api/v1';
    }

    async sendEmail(domain, recipient, campaign) {
        try {
            const response = await axios.post(
                `${this.baseURL}/external-mails/send-by-template`,
                {
                    mail: {
                        to: {
                            email: recipient.email,
                            name: recipient.name || recipient.email.split('@')[0]
                        },
                        from: {
                            email: domain.senderEmail,
                            name: campaign.senderName || domain.senderEmail.split('@')[0]
                        },
                        subject: campaign.subject,
                        previewTitle: campaign.previewTitle,
                        idTemplateMailUser: campaign.templateId,
                        params: campaign.templateParams
                    }
                },
                {
                    headers: {
                        'X-Api-Key': domain.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logger.info(`Email sent successfully to ${recipient.email}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to send email to ${recipient.email}: ${error.message}`);
            throw error;
        }
    }

    async verifyDomain(domain) {
        try {
            const response = await axios.post(
                `${this.baseURL}/domains/verify`,
                {
                    domain: domain.name
                },
                {
                    headers: {
                        'X-Api-Key': domain.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logger.info(`Domain ${domain.name} verified successfully`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to verify domain ${domain.name}: ${error.message}`);
            throw error;
        }
    }

    async getTemplates(domain) {
        try {
            const response = await axios.get(
                `${this.baseURL}/templates`,
                {
                    headers: {
                        'X-Api-Key': domain.apiKey
                    }
                }
            );

            return response.data;
        } catch (error) {
            logger.error(`Failed to get templates for domain ${domain.name}: ${error.message}`);
            throw error;
        }
    }

    async getTemplateDetails(domain, templateId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/templates/${templateId}`,
                {
                    headers: {
                        'X-Api-Key': domain.apiKey
                    }
                }
            );

            return response.data;
        } catch (error) {
            logger.error(`Failed to get template details for template ${templateId}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new RuSenderService(); 
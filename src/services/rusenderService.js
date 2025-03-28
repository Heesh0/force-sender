const axios = require('axios');
const logger = require('../utils/logger');

class RusenderService {
    constructor() {
        this.baseURL = process.env.RUSENDER_API_URL;
    }

    async sendEmail(domain, email, templateId, subject, previewTitle, templateParams = {}) {
        try {
            const response = await axios.post(
                `${this.baseURL}/external-mails/send-by-template`,
                {
                    mail: {
                        to: {
                            email: email,
                            name: ''
                        },
                        from: {
                            email: domain.senderEmail,
                            name: domain.mailFrom
                        },
                        subject: subject,
                        previewTitle: previewTitle,
                        idTemplateMailUser: parseInt(templateId),
                        params: templateParams
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': domain.apiKey
                    }
                }
            );

            logger.info(`Email sent successfully to ${email}`);
            return { success: true, data: response.data };
        } catch (error) {
            logger.error(`Failed to send email to ${email}:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    async sendTestEmail(domain, email, templateId, subject, previewTitle, templateParams = {}) {
        return this.sendEmail(domain, email, templateId, subject, previewTitle, templateParams);
    }
}

module.exports = new RusenderService(); 
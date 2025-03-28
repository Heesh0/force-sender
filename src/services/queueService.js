const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../utils/logger');
const rusenderService = require('./rusenderService');
const { Domain, Email, Mailing } = require('../models');

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

class QueueService {
    constructor() {
        this.emailQueue = new Queue('email-queue', {
            connection: redis
        });

        this.worker = new Worker('email-queue', this.processEmail.bind(this), {
            connection: redis
        });

        this.worker.on('completed', job => {
            logger.info(`Job ${job.id} completed successfully`);
        });

        this.worker.on('failed', (job, error) => {
            logger.error(`Job ${job.id} failed:`, error);
        });
    }

    async processEmail(job) {
        const { email, domainId, mailingId, templateParams } = job.data;

        try {
            const domain = await Domain.findByPk(domainId);
            const mailing = await Mailing.findByPk(mailingId);
            const emailRecord = await Email.findOne({
                where: { email, domainId }
            });

            if (!domain || !mailing || !emailRecord) {
                throw new Error('Required data not found');
            }

            const result = await rusenderService.sendEmail(
                domain,
                email,
                mailing.templateId,
                mailing.subject,
                mailing.previewTitle,
                templateParams
            );

            if (result.success) {
                await emailRecord.update({
                    status: 'sent',
                    sentAt: new Date()
                });

                await mailing.increment('sentCount');
            } else {
                await emailRecord.update({
                    status: 'error',
                    errorMessage: result.error
                });
            }
        } catch (error) {
            logger.error('Error processing email:', error);
            throw error;
        }
    }

    async scheduleMailing(mailing, emails) {
        const startTime = new Date(mailing.startDate);
        const endTime = new Date(mailing.endDate);
        const totalEmails = emails.length;
        const timeRange = endTime - startTime;
        const interval = timeRange / totalEmails;

        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const delay = interval * i;
            const randomDelay = delay * (1 + (Math.random() * 0.1 - 0.05)); // ±5% variation

            await this.emailQueue.add(
                'send-email',
                {
                    email: email.email,
                    domainId: mailing.domainId,
                    mailingId: mailing.id,
                    templateParams: mailing.templateParams
                },
                {
                    delay: randomDelay,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000
                    }
                }
            );
        }

        await mailing.update({ status: 'scheduled' });
    }

    async pauseMailing(mailingId) {
        const mailing = await Mailing.findByPk(mailingId);
        if (!mailing) {
            throw new Error('Mailing not found');
        }

        await mailing.update({ status: 'paused' });
        // Здесь можно добавить логику для приостановки очереди
    }

    async resumeMailing(mailingId) {
        const mailing = await Mailing.findByPk(mailingId);
        if (!mailing) {
            throw new Error('Mailing not found');
        }

        await mailing.update({ status: 'scheduled' });
        // Здесь можно добавить логику для возобновления очереди
    }

    async stopMailing(mailingId) {
        const mailing = await Mailing.findByPk(mailingId);
        if (!mailing) {
            throw new Error('Mailing not found');
        }

        await mailing.update({ status: 'failed' });
        // Здесь можно добавить логику для остановки очереди
    }
}

module.exports = new QueueService(); 
const nodemailer = require('nodemailer');
const { getConfig } = require('./configUtils');
const logger = require('./logger');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');
const { sendEmail } = require('./rusenderUtils');
const { addJob } = require('./queueUtils');

const createNotificationTransporter = () => {
    return nodemailer.createTransport({
        host: getConfig('smtp.host'),
        port: getConfig('smtp.port'),
        secure: getConfig('smtp.secure'),
        auth: {
            user: getConfig('smtp.user'),
            pass: getConfig('smtp.pass')
        }
    });
};

const sendNotification = async (to, subject, content) => {
    try {
        const transporter = createNotificationTransporter();
        const mailOptions = {
            from: `"ForceSender" <${getConfig('smtp.from')}>`,
            to,
            subject,
            html: content
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Отправлено уведомление на ${to}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при отправке уведомления на ${to}:`, error);
        throw error;
    }
};

const sendCampaignNotification = async (campaign) => {
    const subject = `Обновление статуса кампании "${campaign.name}"`;
    const content = `
        <h2>Обновление статуса кампании</h2>
        <p>Кампания: ${campaign.name}</p>
        <p>Статус: ${campaign.status}</p>
        <p>Всего писем: ${campaign.totalEmails}</p>
        <p>Отправлено писем: ${campaign.sentEmails}</p>
        <p>Неудачных отправок: ${campaign.failedEmails}</p>
        <p>Процент открытий: ${campaign.openRate}%</p>
        <p>Процент кликов: ${campaign.clickRate}%</p>
    `;

    return sendNotification(campaign.ownerEmail, subject, content);
};

const sendErrorNotification = async (error, context) => {
    const subject = `Ошибка: ${context}`;
    const content = `
        <h2>Уведомление об ошибке</h2>
        <p>Контекст: ${context}</p>
        <p>Сообщение об ошибке: ${error.message}</p>
        <p>Стек вызовов:</p>
        <pre>${error.stack}</pre>
    `;

    return sendNotification(getConfig('notifications.adminEmail'), subject, content);
};

const sendSystemNotification = async (message, type = 'info') => {
    const subject = `Системное уведомление: ${type.toUpperCase()}`;
    const content = `
        <h2>Системное уведомление</h2>
        <p>Тип: ${type}</p>
        <p>Сообщение: ${message}</p>
        <p>Время: ${new Date().toLocaleString()}</p>
    `;

    return sendNotification(getConfig('notifications.systemEmail'), subject, content);
};

// Отправка email-уведомления
const sendEmailNotification = async (to, subject, content) => {
    try {
        const result = await sendEmail({
            to,
            subject,
            html: content
        });

        logInfo('Отправлено email-уведомление:', {
            to,
            subject,
            result
        });

        return result;
    } catch (error) {
        logError('Ошибка отправки email-уведомления:', {
            to,
            subject,
            error
        });
        throw error;
    }
};

// Отправка SMS-уведомления
const sendSmsNotification = async (phone, message) => {
    try {
        // Здесь будет логика отправки SMS
        // Например, через внешний сервис

        logInfo('Отправлено SMS-уведомление:', {
            phone,
            message
        });

        return true;
    } catch (error) {
        logError('Ошибка отправки SMS-уведомления:', {
            phone,
            message,
            error
        });
        throw error;
    }
};

// Отправка push-уведомления
const sendPushNotification = async (deviceToken, title, body) => {
    try {
        // Здесь будет логика отправки push-уведомлений
        // Например, через Firebase Cloud Messaging

        logInfo('Отправлено push-уведомление:', {
            deviceToken,
            title,
            body
        });

        return true;
    } catch (error) {
        logError('Ошибка отправки push-уведомления:', {
            deviceToken,
            title,
            body,
            error
        });
        throw error;
    }
};

// Отправка webhook-уведомления
const sendWebhookNotification = async (url, payload) => {
    try {
        // Здесь будет логика отправки webhook-уведомлений
        // Например, через HTTP-запрос

        logInfo('Отправлено webhook-уведомление:', {
            url,
            payload
        });

        return true;
    } catch (error) {
        logError('Ошибка отправки webhook-уведомления:', {
            url,
            payload,
            error
        });
        throw error;
    }
};

// Отправка уведомления в очередь
const queueNotification = async (type, data) => {
    try {
        const job = await addJob('notifications', {
            type,
            data,
            timestamp: new Date()
        });

        logInfo('Уведомление добавлено в очередь:', {
            type,
            data,
            jobId: job.id
        });

        return job;
    } catch (error) {
        logError('Ошибка добавления уведомления в очередь:', {
            type,
            data,
            error
        });
        throw error;
    }
};

// Отправка массовых уведомлений
const sendBulkNotifications = async (notifications) => {
    try {
        const results = await Promise.all(
            notifications.map(async (notification) => {
                switch (notification.type) {
                    case 'email':
                        return await sendEmailNotification(
                            notification.to,
                            notification.subject,
                            notification.content
                        );
                    case 'sms':
                        return await sendSmsNotification(
                            notification.phone,
                            notification.message
                        );
                    case 'push':
                        return await sendPushNotification(
                            notification.deviceToken,
                            notification.title,
                            notification.body
                        );
                    case 'webhook':
                        return await sendWebhookNotification(
                            notification.url,
                            notification.payload
                        );
                    default:
                        throw new Error(`Неизвестный тип уведомления: ${notification.type}`);
                }
            })
        );

        logInfo('Отправлены массовые уведомления:', {
            count: notifications.length,
            results
        });

        return results;
    } catch (error) {
        logError('Ошибка отправки массовых уведомлений:', {
            notifications,
            error
        });
        throw error;
    }
};

// Отправка уведомления с шаблоном
const sendTemplatedNotification = async (type, template, data) => {
    try {
        // Здесь будет логика рендеринга шаблона
        // Например, с использованием Handlebars или EJS

        let content;
        switch (type) {
            case 'email':
                content = await renderEmailTemplate(template, data);
                return await sendEmailNotification(data.to, data.subject, content);
            case 'sms':
                content = await renderSmsTemplate(template, data);
                return await sendSmsNotification(data.phone, content);
            case 'push':
                content = await renderPushTemplate(template, data);
                return await sendPushNotification(data.deviceToken, content.title, content.body);
            default:
                throw new Error(`Неизвестный тип уведомления: ${type}`);
        }
    } catch (error) {
        logError('Ошибка отправки уведомления с шаблоном:', {
            type,
            template,
            data,
            error
        });
        throw error;
    }
};

// Рендеринг email-шаблона
const renderEmailTemplate = async (template, data) => {
    try {
        // Здесь будет логика рендеринга email-шаблона
        // Например, с использованием Handlebars
        return template;
    } catch (error) {
        logError('Ошибка рендеринга email-шаблона:', {
            template,
            data,
            error
        });
        throw error;
    }
};

// Рендеринг SMS-шаблона
const renderSmsTemplate = async (template, data) => {
    try {
        // Здесь будет логика рендеринга SMS-шаблона
        return template;
    } catch (error) {
        logError('Ошибка рендеринга SMS-шаблона:', {
            template,
            data,
            error
        });
        throw error;
    }
};

// Рендеринг push-шаблона
const renderPushTemplate = async (template, data) => {
    try {
        // Здесь будет логика рендеринга push-шаблона
        return template;
    } catch (error) {
        logError('Ошибка рендеринга push-шаблона:', {
            template,
            data,
            error
        });
        throw error;
    }
};

module.exports = {
    sendNotification,
    sendCampaignNotification,
    sendErrorNotification,
    sendSystemNotification,
    sendEmailNotification,
    sendSmsNotification,
    sendPushNotification,
    sendWebhookNotification,
    queueNotification,
    sendBulkNotifications,
    sendTemplatedNotification,
    renderEmailTemplate,
    renderSmsTemplate,
    renderPushTemplate
}; 
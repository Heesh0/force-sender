const nodemailer = require('nodemailer');
const { getConfig } = require('./configUtils');
const logger = require('./logger');

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

module.exports = {
    sendNotification,
    sendCampaignNotification,
    sendErrorNotification,
    sendSystemNotification
}; 
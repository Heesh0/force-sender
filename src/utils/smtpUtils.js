const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = (config) => {
    return nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const verifyConnection = async (config) => {
    try {
        const transporter = createTransporter(config);
        await transporter.verify();
        logger.info('SMTP connection verified successfully');
        return true;
    } catch (error) {
        logger.error('SMTP connection verification failed:', error);
        return false;
    }
};

const sendEmail = async (config, emailData) => {
    const transporter = createTransporter(config);

    const mailOptions = {
        from: `"${config.name}" <${config.email}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.content,
        attachments: emailData.attachments || []
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${emailData.to}`);
        return info;
    } catch (error) {
        logger.error(`Error sending email to ${emailData.to}:`, error);
        throw error;
    }
};

const sendTestEmail = async (config, testEmail) => {
    const emailData = {
        to: testEmail,
        subject: 'Test Email from ForceSender',
        content: `
            <h1>Test Email</h1>
            <p>This is a test email sent from ForceSender.</p>
            <p>If you received this email, your SMTP configuration is working correctly.</p>
        `
    };

    return sendEmail(config, emailData);
};

module.exports = {
    createTransporter,
    verifyConnection,
    sendEmail,
    sendTestEmail
}; 
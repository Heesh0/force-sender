const Joi = require('joi');
const logger = require('./logger');

const emailSchema = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required().min(1).max(255),
    content: Joi.string().required().min(1),
    scheduledAt: Joi.date().iso().optional(),
    attachments: Joi.array().items(
        Joi.object({
            filename: Joi.string().required(),
            path: Joi.string().required()
        })
    ).optional()
});

const senderSchema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    email: Joi.string().email().required(),
    smtpHost: Joi.string().required().min(1),
    smtpPort: Joi.number().integer().min(1).max(65535).required(),
    smtpUser: Joi.string().required().min(1),
    smtpPass: Joi.string().required().min(1)
});

const campaignSchema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    subject: Joi.string().required().min(1).max(255),
    content: Joi.string().required().min(1),
    senderId: Joi.number().integer().required(),
    schedule: Joi.object({
        frequency: Joi.string().valid('daily', 'weekly', 'monthly').required(),
        time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
        dayOfMonth: Joi.number().integer().min(1).max(31).optional()
    }).optional()
});

const userSchema = Joi.object({
    username: Joi.string().required().min(3).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    role: Joi.string().valid('admin', 'user').default('user')
});

const validateData = (data, schema) => {
    try {
        const { error } = schema.validate(data);
        if (error) {
            logger.error('Ошибка валидации:', error.details);
            throw new Error(error.details[0].message);
        }
        return true;
    } catch (error) {
        logger.error('Валидация не пройдена:', error);
        throw error;
    }
};

const validateEmail = (data) => validateData(data, emailSchema);
const validateSender = (data) => validateData(data, senderSchema);
const validateCampaign = (data) => validateData(data, campaignSchema);
const validateUser = (data) => validateData(data, userSchema);

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '')
        .trim();
};

const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        throw new Error('Пароль должен содержать минимум 8 символов');
    }
    if (!hasUpperCase) {
        throw new Error('Пароль должен содержать хотя бы одну заглавную букву');
    }
    if (!hasLowerCase) {
        throw new Error('Пароль должен содержать хотя бы одну строчную букву');
    }
    if (!hasNumbers) {
        throw new Error('Пароль должен содержать хотя бы одну цифру');
    }
    if (!hasSpecialChar) {
        throw new Error('Пароль должен содержать хотя бы один специальный символ');
    }

    return true;
};

const validateDomain = (domain) => {
    const domainSchema = Joi.object({
        name: Joi.string().required().min(1).max(100),
        senderEmail: Joi.string().email().required(),
        mailFrom: Joi.string().required().min(1),
        apiKey: Joi.string().required().min(1),
        templateId: Joi.string().required().min(1)
    });

    return validateData(domain, domainSchema);
};

const validateMailing = (mailing) => {
    const mailingSchema = Joi.object({
        name: Joi.string().required().min(1).max(100),
        domainId: Joi.number().integer().required(),
        subject: Joi.string().required().min(1).max(255),
        previewTitle: Joi.string().required().min(1).max(255),
        templateId: Joi.string().required().min(1),
        totalEmails: Joi.number().integer().min(1).required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
        isTest: Joi.boolean().default(false),
        testEmail: Joi.string().email().when('isTest', {
            is: true,
            then: Joi.required()
        }),
        templateParams: Joi.object().optional()
    });

    return validateData(mailing, mailingSchema);
};

module.exports = {
    validateEmail,
    validateSender,
    validateCampaign,
    validateUser,
    validateData,
    sanitizeInput,
    validatePassword,
    validateDomain,
    validateMailing
}; 
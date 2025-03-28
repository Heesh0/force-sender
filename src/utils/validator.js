const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation error',
            details: errors.array()
        });
    }
    next();
};

const emailValidationRules = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('scheduledAt').optional().isISO8601().withMessage('Invalid date format')
];

const senderValidationRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('smtpHost').notEmpty().withMessage('SMTP host is required'),
    body('smtpPort').isInt({ min: 1, max: 65535 }).withMessage('Invalid SMTP port'),
    body('smtpUser').notEmpty().withMessage('SMTP username is required'),
    body('smtpPass').notEmpty().withMessage('SMTP password is required')
];

const campaignValidationRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('senderId').isInt().withMessage('Invalid sender ID'),
    body('schedule').optional().isObject().withMessage('Invalid schedule format')
];

module.exports = {
    validate,
    emailValidationRules,
    senderValidationRules,
    campaignValidationRules
}; 
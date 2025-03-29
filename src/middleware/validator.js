const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation error:', {
            errors: errors.array(),
            path: req.path,
            method: req.method
        });

        return res.status(400).json({
            error: 'Ошибка валидации',
            details: errors.array()
        });
    }
    next();
};

module.exports = validate; 
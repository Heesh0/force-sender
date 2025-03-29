const { body, validationResult } = require('express-validator');
const { logger } = require('./logger');

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

// Функция для проверки результатов валидации
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Ошибка валидации:', {
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

// Функция для валидации email
const validateEmail = (email) => {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);

        logger.info('Валидация email:', {
            email,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации email:', {
            error: error.message,
            email
        });
        throw error;
    }
};

// Функция для валидации пароля
const validatePassword = (password) => {
    try {
        // Минимум 8 символов, минимум 1 буква, 1 цифра и 1 специальный символ
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        const isValid = passwordRegex.test(password);

        logger.info('Валидация пароля:', {
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации пароля:', {
            error: error.message
        });
        throw error;
    }
};

// Функция для валидации URL
const validateUrl = (url) => {
    try {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        const isValid = urlRegex.test(url);

        logger.info('Валидация URL:', {
            url,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации URL:', {
            error: error.message,
            url
        });
        throw error;
    }
};

// Функция для валидации телефона
const validatePhone = (phone) => {
    try {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        const isValid = phoneRegex.test(phone);

        logger.info('Валидация телефона:', {
            phone,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации телефона:', {
            error: error.message,
            phone
        });
        throw error;
    }
};

// Функция для валидации даты
const validateDate = (date) => {
    try {
        const d = new Date(date);
        const isValid = d instanceof Date && !isNaN(d.getTime());

        logger.info('Валидация даты:', {
            date,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации даты:', {
            error: error.message,
            date
        });
        throw error;
    }
};

// Функция для валидации числа
const validateNumber = (number, options = {}) => {
    try {
        const {
            min,
            max,
            integer = false,
            positive = false
        } = options;

        let isValid = !isNaN(number) && typeof number === 'number';

        if (integer) {
            isValid = isValid && Number.isInteger(number);
        }

        if (positive) {
            isValid = isValid && number > 0;
        }

        if (min !== undefined) {
            isValid = isValid && number >= min;
        }

        if (max !== undefined) {
            isValid = isValid && number <= max;
        }

        logger.info('Валидация числа:', {
            number,
            options,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации числа:', {
            error: error.message,
            number,
            options
        });
        throw error;
    }
};

// Функция для валидации строки
const validateString = (str, options = {}) => {
    try {
        const {
            minLength,
            maxLength,
            pattern,
            required = true
        } = options;

        let isValid = typeof str === 'string';

        if (required) {
            isValid = isValid && str.length > 0;
        }

        if (minLength !== undefined) {
            isValid = isValid && str.length >= minLength;
        }

        if (maxLength !== undefined) {
            isValid = isValid && str.length <= maxLength;
        }

        if (pattern) {
            isValid = isValid && pattern.test(str);
        }

        logger.info('Валидация строки:', {
            length: str?.length,
            options,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации строки:', {
            error: error.message,
            options
        });
        throw error;
    }
};

// Функция для валидации массива
const validateArray = (arr, options = {}) => {
    try {
        const {
            minLength,
            maxLength,
            unique = false,
            itemValidator
        } = options;

        let isValid = Array.isArray(arr);

        if (minLength !== undefined) {
            isValid = isValid && arr.length >= minLength;
        }

        if (maxLength !== undefined) {
            isValid = isValid && arr.length <= maxLength;
        }

        if (unique) {
            const uniqueSet = new Set(arr);
            isValid = isValid && uniqueSet.size === arr.length;
        }

        if (itemValidator) {
            isValid = isValid && arr.every(item => itemValidator(item));
        }

        logger.info('Валидация массива:', {
            length: arr?.length,
            options,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации массива:', {
            error: error.message,
            options
        });
        throw error;
    }
};

// Функция для валидации объекта
const validateObject = (obj, schema) => {
    try {
        let isValid = typeof obj === 'object' && obj !== null;

        for (const [key, rules] of Object.entries(schema)) {
            const value = obj[key];
            const isRequired = rules.required !== false;

            if (isRequired && value === undefined) {
                isValid = false;
                break;
            }

            if (value !== undefined) {
                switch (rules.type) {
                    case 'string':
                        isValid = isValid && validateString(value, rules);
                        break;
                    case 'number':
                        isValid = isValid && validateNumber(value, rules);
                        break;
                    case 'date':
                        isValid = isValid && validateDate(value);
                        break;
                    case 'email':
                        isValid = isValid && validateEmail(value);
                        break;
                    case 'url':
                        isValid = isValid && validateUrl(value);
                        break;
                    case 'phone':
                        isValid = isValid && validatePhone(value);
                        break;
                    case 'array':
                        isValid = isValid && validateArray(value, rules);
                        break;
                    case 'object':
                        isValid = isValid && validateObject(value, rules.schema);
                        break;
                }
            }
        }

        logger.info('Валидация объекта:', {
            schema,
            isValid
        });

        return isValid;
    } catch (error) {
        logger.error('Ошибка валидации объекта:', {
            error: error.message,
            schema
        });
        throw error;
    }
};

module.exports = {
    validate,
    emailValidationRules,
    senderValidationRules,
    campaignValidationRules,
    validateRequest,
    validateEmail,
    validatePassword,
    validateUrl,
    validatePhone,
    validateDate,
    validateNumber,
    validateString,
    validateArray,
    validateObject
}; 
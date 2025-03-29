const { body, query, param } = require('express-validator');

// Валидаторы для доменов
const domainValidators = {
    create: [
        body('name')
            .trim()
            .isLength({ min: 3, max: 255 })
            .withMessage('Название домена должно быть от 3 до 255 символов')
            .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/)
            .withMessage('Некорректный формат домена'),
        body('apiKey')
            .trim()
            .notEmpty()
            .withMessage('API ключ обязателен'),
        body('senderEmail')
            .trim()
            .isEmail()
            .withMessage('Некорректный email отправителя')
    ],
    update: [
        param('id')
            .isInt()
            .withMessage('Некорректный ID домена'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 3, max: 255 })
            .withMessage('Название домена должно быть от 3 до 255 символов')
            .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/)
            .withMessage('Некорректный формат домена'),
        body('apiKey')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('API ключ не может быть пустым'),
        body('senderEmail')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Некорректный email отправителя')
    ]
};

// Валидаторы для кампаний
const campaignValidators = {
    create: [
        body('name')
            .trim()
            .isLength({ min: 3, max: 255 })
            .withMessage('Название кампании должно быть от 3 до 255 символов'),
        body('domainId')
            .isInt()
            .withMessage('Некорректный ID домена'),
        body('templateId')
            .trim()
            .notEmpty()
            .withMessage('ID шаблона обязателен'),
        body('parameters')
            .optional()
            .isObject()
            .withMessage('Параметры должны быть объектом')
    ],
    update: [
        param('id')
            .isInt()
            .withMessage('Некорректный ID кампании'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 3, max: 255 })
            .withMessage('Название кампании должно быть от 3 до 255 символов'),
        body('domainId')
            .optional()
            .isInt()
            .withMessage('Некорректный ID домена'),
        body('templateId')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('ID шаблона не может быть пустым'),
        body('parameters')
            .optional()
            .isObject()
            .withMessage('Параметры должны быть объектом')
    ]
};

// Валидаторы для получателей
const recipientValidators = {
    create: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Некорректный email'),
        body('campaignId')
            .isInt()
            .withMessage('Некорректный ID кампании'),
        body('parameters')
            .optional()
            .isObject()
            .withMessage('Параметры должны быть объектом')
    ],
    upload: [
        body('campaignId')
            .isInt()
            .withMessage('Некорректный ID кампании'),
        body('file')
            .custom((value, { req }) => {
                if (!req.file) {
                    throw new Error('Файл обязателен');
                }
                return true;
            })
    ]
};

module.exports = {
    domainValidators,
    campaignValidators,
    recipientValidators
}; 
const handlebars = require('handlebars');
const { logger } = require('./logger');

// Регистрация хелперов для handlebars
handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('ru-RU');
});

handlebars.registerHelper('formatDateTime', function(date) {
    return new Date(date).toLocaleString('ru-RU');
});

handlebars.registerHelper('uppercase', function(str) {
    return str ? str.toUpperCase() : '';
});

handlebars.registerHelper('lowercase', function(str) {
    return str ? str.toLowerCase() : '';
});

// Функция для компиляции шаблона
const compileTemplate = (template) => {
    try {
        const compiled = handlebars.compile(template);
        logger.info('Шаблон успешно скомпилирован');
        return compiled;
    } catch (error) {
        logger.error('Ошибка компиляции шаблона:', error);
        throw error;
    }
};

// Функция для рендеринга шаблона
const renderTemplate = (template, data) => {
    try {
        const compiled = compileTemplate(template);
        const result = compiled(data);
        logger.info('Шаблон успешно отрендерен');
        return result;
    } catch (error) {
        logger.error('Ошибка рендеринга шаблона:', error);
        throw error;
    }
};

// Функция для валидации шаблона
const validateTemplate = (template) => {
    try {
        compileTemplate(template);
        return {
            isValid: true,
            errors: []
        };
    } catch (error) {
        return {
            isValid: false,
            errors: [error.message]
        };
    }
};

// Функция для проверки наличия всех необходимых переменных в шаблоне
const checkTemplateVariables = (template, data) => {
    const variables = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(template)) !== null) {
        const variable = match[1].trim();
        if (!variable.startsWith('@') && !variable.startsWith('#') && !variable.startsWith('/')) {
            variables.push(variable);
        }
    }

    const missingVariables = variables.filter(variable => {
        const path = variable.split('.');
        let value = data;
        
        for (const key of path) {
            if (value === undefined || value === null) {
                return true;
            }
            value = value[key];
        }
        
        return value === undefined || value === null;
    });

    return {
        hasAllVariables: missingVariables.length === 0,
        missingVariables
    };
};

// Функция для создания HTML-версии шаблона
const createHtmlVersion = (textTemplate) => {
    try {
        // Заменяем переносы строк на <br>
        const html = textTemplate
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

        // Оборачиваем в базовый HTML-шаблон
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Template</title>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;
    } catch (error) {
        logger.error('Ошибка создания HTML-версии шаблона:', error);
        throw error;
    }
};

// Функция для создания текстовой версии из HTML
const createTextVersion = (htmlTemplate) => {
    try {
        // Удаляем HTML-теги
        const text = htmlTemplate
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");

        // Удаляем лишние пробелы и переносы строк
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    } catch (error) {
        logger.error('Ошибка создания текстовой версии шаблона:', error);
        throw error;
    }
};

module.exports = {
    compileTemplate,
    renderTemplate,
    validateTemplate,
    checkTemplateVariables,
    createHtmlVersion,
    createTextVersion
}; 
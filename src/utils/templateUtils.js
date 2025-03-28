const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const loadTemplate = async (templateName) => {
    try {
        const templatePath = path.join(__dirname, '../../templates', `${templateName}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        return handlebars.compile(templateContent);
    } catch (error) {
        logger.error(`Ошибка при загрузке шаблона ${templateName}:`, error);
        throw new Error(`Шаблон ${templateName} не найден`);
    }
};

const renderTemplate = async (templateName, data) => {
    try {
        const template = await loadTemplate(templateName);
        return template(data);
    } catch (error) {
        logger.error(`Ошибка при рендеринге шаблона ${templateName}:`, error);
        throw error;
    }
};

const registerPartial = async (partialName) => {
    try {
        const partialPath = path.join(__dirname, '../../templates/partials', `${partialName}.hbs`);
        const partialContent = await fs.readFile(partialPath, 'utf-8');
        handlebars.registerPartial(partialName, partialContent);
    } catch (error) {
        logger.error(`Ошибка при регистрации частичного шаблона ${partialName}:`, error);
        throw new Error(`Частичный шаблон ${partialName} не найден`);
    }
};

const registerHelpers = () => {
    handlebars.registerHelper('formatDate', (date) => {
        return new Date(date).toLocaleDateString('ru-RU');
    });

    handlebars.registerHelper('ifEquals', (arg1, arg2, options) => {
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });

    handlebars.registerHelper('concat', (...args) => {
        args.pop();
        return args.join('');
    });

    handlebars.registerHelper('uppercase', (str) => {
        return str.toUpperCase();
    });

    handlebars.registerHelper('lowercase', (str) => {
        return str.toLowerCase();
    });

    handlebars.registerHelper('capitalize', (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    handlebars.registerHelper('truncate', (str, len) => {
        if (str.length > len) {
            return str.substring(0, len) + '...';
        }
        return str;
    });

    handlebars.registerHelper('repeat', (str, times) => {
        return str.repeat(times);
    });

    handlebars.registerHelper('replace', (str, search, replace) => {
        return str.replace(new RegExp(search, 'g'), replace);
    });

    handlebars.registerHelper('math', (lvalue, operator, rvalue) => {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
            '+': lvalue + rvalue,
            '-': lvalue - rvalue,
            '*': lvalue * rvalue,
            '/': lvalue / rvalue,
            '%': lvalue % rvalue
        }[operator];
    });
};

const createTemplate = async (templateName, content) => {
    try {
        const templatePath = path.join(__dirname, '../../templates', `${templateName}.hbs`);
        await fs.writeFile(templatePath, content, 'utf-8');
        logger.info(`Создан шаблон: ${templateName}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при создании шаблона ${templateName}:`, error);
        throw error;
    }
};

const updateTemplate = async (templateName, content) => {
    try {
        const templatePath = path.join(__dirname, '../../templates', `${templateName}.hbs`);
        await fs.writeFile(templatePath, content, 'utf-8');
        logger.info(`Обновлен шаблон: ${templateName}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при обновлении шаблона ${templateName}:`, error);
        throw error;
    }
};

const deleteTemplate = async (templateName) => {
    try {
        const templatePath = path.join(__dirname, '../../templates', `${templateName}.hbs`);
        await fs.unlink(templatePath);
        logger.info(`Удален шаблон: ${templateName}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при удалении шаблона ${templateName}:`, error);
        throw error;
    }
};

const listTemplates = async () => {
    try {
        const templatesDir = path.join(__dirname, '../../templates');
        const files = await fs.readdir(templatesDir);
        return files
            .filter(file => file.endsWith('.hbs'))
            .map(file => file.replace('.hbs', ''));
    } catch (error) {
        logger.error('Ошибка при получении списка шаблонов:', error);
        throw error;
    }
};

module.exports = {
    loadTemplate,
    renderTemplate,
    registerPartial,
    registerHelpers,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    listTemplates
}; 
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');

// Регистрация вспомогательных функций для Handlebars
handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('ru-RU');
});

handlebars.registerHelper('formatNumber', function(number) {
    return new Number(number).toLocaleString('ru-RU');
});

handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

// Загрузка шаблона из файла
const loadTemplate = async (templatePath) => {
    try {
        const content = await fs.readFile(templatePath, 'utf-8');
        logInfo('Загружен шаблон:', { path: templatePath });
        return content;
    } catch (error) {
        logError('Ошибка загрузки шаблона:', { path: templatePath, error });
        throw error;
    }
};

// Компиляция шаблона
const compileTemplate = async (template, data) => {
    try {
        const compiledTemplate = handlebars.compile(template);
        const result = compiledTemplate(data);
        logInfo('Шаблон скомпилирован:', { data });
        return result;
    } catch (error) {
        logError('Ошибка компиляции шаблона:', { data, error });
        throw error;
    }
};

// Создание нового шаблона
const createTemplate = async (name, content) => {
    try {
        const templatePath = path.join(config.app.templatesDir, `${name}.hbs`);
        await fs.writeFile(templatePath, content);
        logInfo('Создан новый шаблон:', { name });
        return templatePath;
    } catch (error) {
        logError('Ошибка создания шаблона:', { name, error });
        throw error;
    }
};

// Обновление существующего шаблона
const updateTemplate = async (name, content) => {
    try {
        const templatePath = path.join(config.app.templatesDir, `${name}.hbs`);
        await fs.writeFile(templatePath, content);
        logInfo('Обновлен шаблон:', { name });
        return templatePath;
    } catch (error) {
        logError('Ошибка обновления шаблона:', { name, error });
        throw error;
    }
};

// Удаление шаблона
const deleteTemplate = async (name) => {
    try {
        const templatePath = path.join(config.app.templatesDir, `${name}.hbs`);
        await fs.unlink(templatePath);
        logInfo('Удален шаблон:', { name });
        return true;
    } catch (error) {
        logError('Ошибка удаления шаблона:', { name, error });
        throw error;
    }
};

// Получение списка всех шаблонов
const listTemplates = async () => {
    try {
        const files = await fs.readdir(config.app.templatesDir);
        const templates = files
            .filter(file => file.endsWith('.hbs'))
            .map(file => ({
                name: path.basename(file, '.hbs'),
                path: path.join(config.app.templatesDir, file)
            }));

        logInfo('Получен список шаблонов:', { count: templates.length });
        return templates;
    } catch (error) {
        logError('Ошибка получения списка шаблонов:', error);
        throw error;
    }
};

// Получение информации о шаблоне
const getTemplateInfo = async (name) => {
    try {
        const templatePath = path.join(config.app.templatesDir, `${name}.hbs`);
        const stats = await fs.stat(templatePath);
        const content = await fs.readFile(templatePath, 'utf-8');

        const info = {
            name,
            path: templatePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            content
        };

        logInfo('Получена информация о шаблоне:', { name });
        return info;
    } catch (error) {
        logError('Ошибка получения информации о шаблоне:', { name, error });
        throw error;
    }
};

// Валидация шаблона
const validateTemplate = async (content) => {
    try {
        handlebars.compile(content);
        logInfo('Шаблон валиден');
        return true;
    } catch (error) {
        logError('Ошибка валидации шаблона:', error);
        return false;
    }
};

// Получение переменных шаблона
const getTemplateVariables = async (content) => {
    try {
        const ast = handlebars.parse(content);
        const variables = new Set();

        const traverse = (node) => {
            if (node.type === 'MustacheStatement') {
                variables.add(node.path.original);
            }
            if (node.program) {
                traverse(node.program);
            }
            if (node.inverse) {
                traverse(node.inverse);
            }
        };

        traverse(ast);
        logInfo('Получены переменные шаблона:', { variables: Array.from(variables) });
        return Array.from(variables);
    } catch (error) {
        logError('Ошибка получения переменных шаблона:', error);
        throw error;
    }
};

// Предварительный просмотр шаблона
const previewTemplate = async (name, data) => {
    try {
        const template = await loadTemplate(path.join(config.app.templatesDir, `${name}.hbs`));
        const result = await compileTemplate(template, data);
        logInfo('Создан предварительный просмотр шаблона:', { name });
        return result;
    } catch (error) {
        logError('Ошибка создания предварительного просмотра шаблона:', { name, error });
        throw error;
    }
};

// Копирование шаблона
const copyTemplate = async (sourceName, targetName) => {
    try {
        const sourcePath = path.join(config.app.templatesDir, `${sourceName}.hbs`);
        const targetPath = path.join(config.app.templatesDir, `${targetName}.hbs`);
        
        await fs.copyFile(sourcePath, targetPath);
        logInfo('Шаблон скопирован:', { source: sourceName, target: targetName });
        return targetPath;
    } catch (error) {
        logError('Ошибка копирования шаблона:', { source: sourceName, target: targetName, error });
        throw error;
    }
};

module.exports = {
    loadTemplate,
    compileTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    listTemplates,
    getTemplateInfo,
    validateTemplate,
    getTemplateVariables,
    previewTemplate,
    copyTemplate
}; 
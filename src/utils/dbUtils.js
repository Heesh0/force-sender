const { Sequelize } = require('sequelize');
const logger = require('./logger');
const { getConfig } = require('./configUtils');

const sequelize = new Sequelize(
    getConfig('db.name'),
    getConfig('db.user'),
    getConfig('db.password'),
    {
        host: getConfig('db.host'),
        port: getConfig('db.port'),
        dialect: getConfig('db.dialect'),
        logging: (msg) => logger.debug(msg),
        pool: {
            max: getConfig('db.pool.max'),
            min: getConfig('db.pool.min'),
            acquire: getConfig('db.pool.acquire'),
            idle: getConfig('db.pool.idle')
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Подключение к базе данных успешно установлено');
        return true;
    } catch (error) {
        logger.error('Ошибка подключения к базе данных:', error);
        return false;
    }
};

const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        logger.info(`База данных синхронизирована${force ? ' (принудительно)' : ''}`);
        return true;
    } catch (error) {
        logger.error('Ошибка синхронизации базы данных:', error);
        return false;
    }
};

const transaction = async (callback) => {
    const t = await sequelize.transaction();
    try {
        const result = await callback(t);
        await t.commit();
        return result;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const createModel = (name, attributes, options = {}) => {
    try {
        return sequelize.define(name, attributes, {
            timestamps: true,
            ...options
        });
    } catch (error) {
        logger.error(`Ошибка при создании модели ${name}:`, error);
        throw error;
    }
};

const createAssociation = (sourceModel, targetModel, type, options = {}) => {
    try {
        switch (type) {
            case 'hasOne':
                sourceModel.hasOne(targetModel, options);
                break;
            case 'hasMany':
                sourceModel.hasMany(targetModel, options);
                break;
            case 'belongsTo':
                sourceModel.belongsTo(targetModel, options);
                break;
            case 'belongsToMany':
                sourceModel.belongsToMany(targetModel, options);
                break;
            default:
                throw new Error(`Неизвестный тип ассоциации: ${type}`);
        }
        logger.debug(`Создана ассоциация ${type} между ${sourceModel.name} и ${targetModel.name}`);
    } catch (error) {
        logger.error(`Ошибка при создании ассоциации между ${sourceModel.name} и ${targetModel.name}:`, error);
        throw error;
    }
};

const createIndex = (model, fields, options = {}) => {
    try {
        model.addIndex(fields, options);
        logger.debug(`Создан индекс для модели ${model.name}`);
    } catch (error) {
        logger.error(`Ошибка при создании индекса для модели ${model.name}:`, error);
        throw error;
    }
};

const createUniqueConstraint = (model, fields) => {
    try {
        model.addConstraint(fields, {
            type: 'unique',
            name: `${model.name}_${fields.join('_')}_unique`
        });
        logger.debug(`Создано ограничение уникальности для модели ${model.name}`);
    } catch (error) {
        logger.error(`Ошибка при создании ограничения уникальности для модели ${model.name}:`, error);
        throw error;
    }
};

const createForeignKey = (model, field, targetModel, options = {}) => {
    try {
        model.addColumn(field, {
            type: Sequelize.INTEGER,
            references: {
                model: targetModel,
                key: 'id'
            },
            ...options
        });
        logger.debug(`Создан внешний ключ для модели ${model.name}`);
    } catch (error) {
        logger.error(`Ошибка при создании внешнего ключа для модели ${model.name}:`, error);
        throw error;
    }
};

const bulkCreate = async (model, records, options = {}) => {
    try {
        const result = await model.bulkCreate(records, {
            returning: true,
            ...options
        });
        logger.debug(`Создано ${result.length} записей в модели ${model.name}`);
        return result;
    } catch (error) {
        logger.error(`Ошибка при массовом создании записей в модели ${model.name}:`, error);
        throw error;
    }
};

const bulkUpdate = async (model, records, options = {}) => {
    try {
        const result = await model.bulkCreate(records, {
            updateOnDuplicate: Object.keys(records[0]),
            ...options
        });
        logger.debug(`Обновлено ${result.length} записей в модели ${model.name}`);
        return result;
    } catch (error) {
        logger.error(`Ошибка при массовом обновлении записей в модели ${model.name}:`, error);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase,
    transaction,
    createModel,
    createAssociation,
    createIndex,
    createUniqueConstraint,
    createForeignKey,
    bulkCreate,
    bulkUpdate
}; 
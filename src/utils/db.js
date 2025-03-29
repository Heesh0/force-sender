const { Sequelize } = require('sequelize');
const config = require('../config/app');
const { logger } = require('./logger');

// Создаем экземпляр Sequelize
const sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        logging: config.database.logging,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Функция для проверки подключения к базе данных
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

// Функция для синхронизации моделей с базой данных
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        logger.info(`База данных успешно синхронизирована (force: ${force})`);
        return true;
    } catch (error) {
        logger.error('Ошибка синхронизации базы данных:', error);
        return false;
    }
};

// Функция для закрытия соединения с базой данных
const closeConnection = async () => {
    try {
        await sequelize.close();
        logger.info('Соединение с базой данных закрыто');
        return true;
    } catch (error) {
        logger.error('Ошибка закрытия соединения с базой данных:', error);
        return false;
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase,
    closeConnection
}; 
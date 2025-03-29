const { Sequelize } = require('sequelize');
const { logInfo, logError } = require('../utils/logger');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: (msg) => logInfo('SQL Query:', { query: msg }),
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    }
);

// Проверка подключения к базе данных
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logInfo('Подключение к базе данных успешно установлено');
    } catch (error) {
        logError('Ошибка подключения к базе данных:', error);
        throw error;
    }
};

// Синхронизация моделей с базой данных
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        logInfo('База данных синхронизирована', { force });
    } catch (error) {
        logError('Ошибка синхронизации базы данных:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    testConnection,
    syncDatabase
}; 
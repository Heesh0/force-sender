const { getConfig } = require('../utils/configUtils');

module.exports = {
    development: {
        username: getConfig('db.user'),
        password: getConfig('db.password'),
        database: getConfig('db.name'),
        host: getConfig('db.host'),
        port: getConfig('db.port'),
        dialect: getConfig('db.dialect'),
        logging: (msg) => console.log(msg),
        pool: {
            max: getConfig('db.pool.max'),
            min: getConfig('db.pool.min'),
            acquire: getConfig('db.pool.acquire'),
            idle: getConfig('db.pool.idle')
        }
    },
    test: {
        username: getConfig('db.user'),
        password: getConfig('db.password'),
        database: getConfig('db.name') + '_test',
        host: getConfig('db.host'),
        port: getConfig('db.port'),
        dialect: getConfig('db.dialect'),
        logging: false,
        pool: {
            max: getConfig('db.pool.max'),
            min: getConfig('db.pool.min'),
            acquire: getConfig('db.pool.acquire'),
            idle: getConfig('db.pool.idle')
        }
    },
    production: {
        username: getConfig('db.user'),
        password: getConfig('db.password'),
        database: getConfig('db.name'),
        host: getConfig('db.host'),
        port: getConfig('db.port'),
        dialect: getConfig('db.dialect'),
        logging: false,
        pool: {
            max: getConfig('db.pool.max'),
            min: getConfig('db.pool.min'),
            acquire: getConfig('db.pool.acquire'),
            idle: getConfig('db.pool.idle')
        }
    }
}; 
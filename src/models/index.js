const { Sequelize } = require('sequelize');
const config = require('../config/database');
const { createAssociation } = require('../utils/dbUtils');

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: 'postgres',
        logging: false
    }
);

const Domain = require('./Domain');
const Email = require('./Email');
const Mailing = require('./Mailing');
const Campaign = require('./Campaign');
const Recipient = require('./Recipient');
const User = require('./User');

// Определяем связи между моделями
Domain.hasMany(Email, { foreignKey: 'domainId' });
Email.belongsTo(Domain, { foreignKey: 'domainId' });

Domain.hasMany(Mailing, { foreignKey: 'domainId' });
Mailing.belongsTo(Domain, { foreignKey: 'domainId' });

// Связи между доменами и кампаниями
createAssociation(Domain, Campaign, 'hasMany', {
    foreignKey: 'domainId',
    as: 'campaigns'
});
createAssociation(Campaign, Domain, 'belongsTo', {
    foreignKey: 'domainId',
    as: 'domain'
});

// Связи между кампаниями и получателями
createAssociation(Campaign, Recipient, 'hasMany', {
    foreignKey: 'campaignId',
    as: 'recipients'
});
createAssociation(Recipient, Campaign, 'belongsTo', {
    foreignKey: 'campaignId',
    as: 'campaign'
});

// Связи между пользователями и доменами
createAssociation(User, Domain, 'hasMany', {
    foreignKey: 'userId',
    as: 'domains'
});
createAssociation(Domain, User, 'belongsTo', {
    foreignKey: 'userId',
    as: 'user'
});

// Связи между пользователями и кампаниями
createAssociation(User, Campaign, 'hasMany', {
    foreignKey: 'userId',
    as: 'campaigns'
});
createAssociation(Campaign, User, 'belongsTo', {
    foreignKey: 'userId',
    as: 'user'
});

module.exports = {
    sequelize,
    Domain,
    Email,
    Mailing,
    Campaign,
    Recipient,
    User
}; 
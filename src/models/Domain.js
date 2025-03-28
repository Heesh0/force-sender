const { DataTypes } = require('sequelize');
const { createModel, createUniqueConstraint } = require('../utils/dbUtils');

const Domain = createModel('Domain', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    senderEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    mailFrom: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    apiKey: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    templateId: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active'
    },
    totalEmails: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    successfulDeliveries: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    failedDeliveries: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bounceRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    spamRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    lastUsed: {
        type: DataTypes.DATE
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'domains',
    indexes: [
        {
            unique: true,
            fields: ['name']
        },
        {
            fields: ['status']
        },
        {
            fields: ['lastUsed']
        }
    ]
});

// Создаем уникальное ограничение для имени домена
createUniqueConstraint(Domain, ['name']);

module.exports = Domain; 
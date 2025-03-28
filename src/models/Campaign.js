const { DataTypes } = require('sequelize');
const { createModel, createUniqueConstraint, createForeignKey } = require('../utils/dbUtils');
const Domain = require('./Domain');

const Campaign = createModel('Campaign', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    domainId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Domain,
            key: 'id'
        }
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    previewTitle: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    templateId: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    templateParams: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    totalEmails: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sentEmails: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    failedEmails: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    openRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    clickRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'running', 'paused', 'completed', 'failed'),
        defaultValue: 'draft'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isTest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    testEmail: {
        type: DataTypes.STRING(255),
        validate: {
            isEmail: true
        }
    },
    schedule: {
        type: DataTypes.JSON,
        defaultValue: null
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
    tableName: 'campaigns',
    indexes: [
        {
            fields: ['domainId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['startDate']
        },
        {
            fields: ['endDate']
        }
    ]
});

// Создаем внешний ключ для связи с доменом
createForeignKey(Campaign, 'domainId', Domain);

// Создаем уникальное ограничение для имени кампании в рамках домена
createUniqueConstraint(Campaign, ['name', 'domainId']);

module.exports = Campaign; 
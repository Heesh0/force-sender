const { DataTypes } = require('sequelize');
const { createModel, createUniqueConstraint, createForeignKey } = require('../utils/dbUtils');
const Campaign = require('./Campaign');

const Recipient = createModel('Recipient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Campaign,
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    name: {
        type: DataTypes.STRING(100)
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed', 'bounced', 'unsubscribed'),
        defaultValue: 'pending'
    },
    sentAt: {
        type: DataTypes.DATE
    },
    openedAt: {
        type: DataTypes.DATE
    },
    clickedAt: {
        type: DataTypes.DATE
    },
    errorMessage: {
        type: DataTypes.TEXT
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
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
    tableName: 'recipients',
    indexes: [
        {
            fields: ['campaignId']
        },
        {
            fields: ['email']
        },
        {
            fields: ['status']
        },
        {
            fields: ['sentAt']
        }
    ]
});

// Создаем внешний ключ для связи с кампанией
createForeignKey(Recipient, 'campaignId', Campaign);

// Создаем уникальное ограничение для email в рамках кампании
createUniqueConstraint(Recipient, ['campaignId', 'email']);

module.exports = Recipient; 
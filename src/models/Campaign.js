const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { logInfo } = require('../utils/logger');
const Domain = require('./Domain');
const { createModel, createUniqueConstraint, createForeignKey } = require('../utils/dbUtils');

const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Senders',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'running', 'completed', 'failed', 'cancelled'),
        defaultValue: 'draft'
    },
    schedule: {
        type: DataTypes.JSON,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    totalRecipients: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    failedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bounceCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    unsubscribeCount: {
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
    spamScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    hooks: {
        beforeCreate: async (campaign) => {
            logInfo('Создание новой кампании:', {
                name: campaign.name,
                userId: campaign.userId
            });
        },
        beforeUpdate: async (campaign) => {
            if (campaign.changed('status')) {
                logInfo('Изменение статуса кампании:', {
                    id: campaign.id,
                    oldStatus: campaign.previous('status'),
                    newStatus: campaign.status
                });
            }
        }
    }
});

// Создаем внешний ключ для связи с доменом
createForeignKey(Campaign, 'domainId', Domain);

// Создаем уникальное ограничение для имени кампании в рамках домена
createUniqueConstraint(Campaign, ['name', 'domainId']);

// Методы экземпляра
Campaign.prototype.updateStats = async function(stats) {
    Object.assign(this, stats);
    await this.save();
    logInfo('Обновление статистики кампании:', {
        id: this.id,
        stats
    });
};

Campaign.prototype.cancel = async function() {
    this.status = 'cancelled';
    await this.save();
    logInfo('Отмена кампании:', {
        id: this.id
    });
};

// Методы класса
Campaign.findByUserId = async function(userId) {
    const campaigns = await this.findAll({ where: { userId } });
    logInfo('Поиск кампаний по userId:', {
        userId,
        count: campaigns.length
    });
    return campaigns;
};

Campaign.findActive = async function() {
    const campaigns = await this.findAll({
        where: {
            status: ['scheduled', 'running'],
            startDate: {
                [sequelize.Op.lte]: new Date()
            }
        }
    });
    logInfo('Поиск активных кампаний:', {
        count: campaigns.length
    });
    return campaigns;
};

module.exports = Campaign; 
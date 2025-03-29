const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { logInfo } = require('../utils/logger');

const Recipient = sequelize.define('Recipient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Campaigns',
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'spam', 'failed'),
        defaultValue: 'pending'
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    openedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    clickedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    bouncedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    unsubscribedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    spamAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    failedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    bounceReason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    hooks: {
        beforeCreate: async (recipient) => {
            logInfo('Создание нового получателя:', {
                email: recipient.email,
                campaignId: recipient.campaignId
            });
        },
        beforeUpdate: async (recipient) => {
            if (recipient.changed('status')) {
                logInfo('Изменение статуса получателя:', {
                    id: recipient.id,
                    email: recipient.email,
                    oldStatus: recipient.previous('status'),
                    newStatus: recipient.status
                });
            }
        }
    }
});

// Методы экземпляра
Recipient.prototype.updateStatus = async function(status, timestamp = new Date()) {
    this.status = status;
    switch (status) {
        case 'sent':
            this.sentAt = timestamp;
            break;
        case 'delivered':
            this.deliveredAt = timestamp;
            break;
        case 'opened':
            this.openedAt = timestamp;
            break;
        case 'clicked':
            this.clickedAt = timestamp;
            break;
        case 'bounced':
            this.bouncedAt = timestamp;
            break;
        case 'unsubscribed':
            this.unsubscribedAt = timestamp;
            break;
        case 'spam':
            this.spamAt = timestamp;
            break;
        case 'failed':
            this.failedAt = timestamp;
            break;
    }
    await this.save();
    logInfo('Обновление статуса получателя:', {
        id: this.id,
        email: this.email,
        status,
        timestamp
    });
};

// Методы класса
Recipient.findByCampaign = async function(campaignId) {
    const recipients = await this.findAll({ where: { campaignId } });
    logInfo('Поиск получателей по campaignId:', {
        campaignId,
        count: recipients.length
    });
    return recipients;
};

Recipient.findByEmail = async function(email) {
    const recipients = await this.findAll({ where: { email } });
    logInfo('Поиск получателей по email:', {
        email,
        count: recipients.length
    });
    return recipients;
};

Recipient.findPending = async function(campaignId) {
    const recipients = await this.findAll({
        where: {
            campaignId,
            status: 'pending'
        }
    });
    logInfo('Поиск ожидающих получателей:', {
        campaignId,
        count: recipients.length
    });
    return recipients;
};

module.exports = Recipient; 
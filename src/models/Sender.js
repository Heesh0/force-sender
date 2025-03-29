const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { encryptString, decryptString } = require('../utils/crypto');
const { logInfo } = require('../utils/logger');

const Sender = sequelize.define('Sender', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    smtpHost: {
        type: DataTypes.STRING,
        allowNull: false
    },
    smtpPort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 65535
        }
    },
    smtpUser: {
        type: DataTypes.STRING,
        allowNull: false
    },
    smtpPass: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastUsed: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dailyLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 1000
    },
    monthlyLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 30000
    }
}, {
    hooks: {
        beforeCreate: async (sender) => {
            if (sender.smtpPass) {
                const key = process.env.ENCRYPTION_KEY;
                const encrypted = encryptString(sender.smtpPass, key);
                sender.smtpPass = encrypted.encrypted;
            }
        },
        beforeUpdate: async (sender) => {
            if (sender.changed('smtpPass')) {
                const key = process.env.ENCRYPTION_KEY;
                const encrypted = encryptString(sender.smtpPass, key);
                sender.smtpPass = encrypted.encrypted;
            }
        }
    }
});

// Методы экземпляра
Sender.prototype.getDecryptedPassword = function() {
    const key = process.env.ENCRYPTION_KEY;
    return decryptString(this.smtpPass, key);
};

Sender.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.smtpPass;
    return values;
};

// Методы класса
Sender.findByEmail = async function(email) {
    const sender = await this.findOne({ where: { email } });
    logInfo('Поиск отправителя по email:', { email, found: !!sender });
    return sender;
};

Sender.findByUserId = async function(userId) {
    const senders = await this.findAll({ where: { userId } });
    logInfo('Поиск отправителей по userId:', { userId, count: senders.length });
    return senders;
};

module.exports = Sender; 
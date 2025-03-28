const { DataTypes } = require('sequelize');
const { createModel, createUniqueConstraint } = require('../utils/dbUtils');
const bcrypt = require('bcryptjs');

const User = createModel('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE
    },
    apiKey: {
        type: DataTypes.STRING(255),
        unique: true
    },
    settings: {
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
    tableName: 'users',
    indexes: [
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['apiKey']
        },
        {
            fields: ['role']
        },
        {
            fields: ['isActive']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
            if (!user.apiKey) {
                user.apiKey = await generateApiKey();
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Создаем уникальные ограничения
createUniqueConstraint(User, ['username']);
createUniqueConstraint(User, ['email']);
createUniqueConstraint(User, ['apiKey']);

// Методы экземпляра
User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

User.prototype.generateApiKey = async function() {
    const apiKey = await generateApiKey();
    this.apiKey = apiKey;
    await this.save();
    return apiKey;
};

// Вспомогательные функции
const generateApiKey = async () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
};

module.exports = User; 
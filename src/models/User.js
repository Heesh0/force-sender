const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { hashPassword, generateSalt } = require('../utils/crypto');
const { logInfo } = require('../utils/logger');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
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
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.salt = generateSalt();
                user.password = hashPassword(user.password, user.salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.salt = generateSalt();
                user.password = hashPassword(user.password, user.salt);
            }
        }
    }
});

// Методы экземпляра
User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.salt;
    return values;
};

// Методы класса
User.findByEmail = async function(email) {
    const user = await this.findOne({ where: { email } });
    logInfo('Поиск пользователя по email:', { email, found: !!user });
    return user;
};

module.exports = User; 
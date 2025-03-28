const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Email = sequelize.define('Email', {
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
    status: {
        type: DataTypes.ENUM('new', 'sent', 'error'),
        defaultValue: 'new'
    },
    sentAt: {
        type: DataTypes.DATE
    },
    errorMessage: {
        type: DataTypes.TEXT
    },
    domainId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Domains',
            key: 'id'
        }
    }
});

module.exports = Email; 
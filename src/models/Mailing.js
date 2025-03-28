const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Mailing = sequelize.define('Mailing', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    domainId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Domains',
            key: 'id'
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    previewTitle: {
        type: DataTypes.STRING
    },
    templateId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalEmails: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'running', 'paused', 'completed', 'failed'),
        defaultValue: 'scheduled'
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
        type: DataTypes.STRING
    },
    templateParams: {
        type: DataTypes.JSON
    }
});

module.exports = Mailing; 
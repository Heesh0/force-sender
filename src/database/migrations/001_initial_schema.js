const mysql = require('mysql2/promise');
const config = require('../../config/app');

async function up() {
    const connection = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password
    });

    try {
        // Создание базы данных
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`USE ${config.db.name}`);

        // Создание таблицы пользователей
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Создание таблицы отправителей
        await connection.query(`
            CREATE TABLE IF NOT EXISTS senders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                domain VARCHAR(255) NOT NULL,
                status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Создание таблицы кампаний
        await connection.query(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                sender_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                status ENUM('draft', 'scheduled', 'running', 'completed', 'stopped') NOT NULL DEFAULT 'draft',
                schedule JSON,
                total_recipients INT DEFAULT 0,
                sent_count INT DEFAULT 0,
                failed_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES senders(id) ON DELETE CASCADE
            )
        `);

        // Создание таблицы получателей
        await connection.query(`
            CREATE TABLE IF NOT EXISTS recipients (
                id INT PRIMARY KEY AUTO_INCREMENT,
                campaign_id INT NOT NULL,
                email VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                status ENUM('pending', 'sent', 'failed', 'bounced') NOT NULL DEFAULT 'pending',
                error_message TEXT,
                sent_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
            )
        `);

        // Создание индексов
        await connection.query(`CREATE INDEX idx_users_email ON users(email)`);
        await connection.query(`CREATE INDEX idx_senders_user_id ON senders(user_id)`);
        await connection.query(`CREATE INDEX idx_campaigns_user_id ON campaigns(user_id)`);
        await connection.query(`CREATE INDEX idx_campaigns_sender_id ON campaigns(sender_id)`);
        await connection.query(`CREATE INDEX idx_recipients_campaign_id ON recipients(campaign_id)`);
        await connection.query(`CREATE INDEX idx_recipients_email ON recipients(email)`);
        await connection.query(`CREATE INDEX idx_recipients_status ON recipients(status)`);

        console.log('Миграция успешно выполнена');
    } catch (error) {
        console.error('Ошибка при выполнении миграции:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

async function down() {
    const connection = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password
    });

    try {
        await connection.query(`USE ${config.db.name}`);

        // Удаление таблиц в обратном порядке
        await connection.query('DROP TABLE IF EXISTS recipients');
        await connection.query('DROP TABLE IF EXISTS campaigns');
        await connection.query('DROP TABLE IF EXISTS senders');
        await connection.query('DROP TABLE IF EXISTS users');

        // Удаление базы данных
        await connection.query(`DROP DATABASE IF EXISTS ${config.db.name}`);

        console.log('Откат миграции успешно выполнен');
    } catch (error) {
        console.error('Ошибка при откате миграции:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = { up, down }; 
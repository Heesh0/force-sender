const fs = require('fs').promises;
const path = require('path');
const { logInfo, logError } = require('../utils/logger');

async function runMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files.filter(file => file.endsWith('.js')).sort();

        for (const file of migrationFiles) {
            const migration = require(path.join(migrationsDir, file));
            logInfo(`Запуск миграции: ${file}`);
            await migration.up();
            logInfo(`Миграция ${file} успешно выполнена`);
        }

        logInfo('Все миграции успешно выполнены');
    } catch (error) {
        logError('Ошибка при выполнении миграций:', error);
        process.exit(1);
    }
}

async function rollbackMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files.filter(file => file.endsWith('.js')).sort().reverse();

        for (const file of migrationFiles) {
            const migration = require(path.join(migrationsDir, file));
            logInfo(`Откат миграции: ${file}`);
            await migration.down();
            logInfo(`Миграция ${file} успешно откачена`);
        }

        logInfo('Все миграции успешно откачены');
    } catch (error) {
        logError('Ошибка при откате миграций:', error);
        process.exit(1);
    }
}

const command = process.argv[2];

if (command === 'up') {
    runMigrations();
} else if (command === 'down') {
    rollbackMigrations();
} else {
    console.error('Использование: node migrate.js [up|down]');
    process.exit(1);
} 
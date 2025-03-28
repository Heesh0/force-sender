const app = require('./app');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Необработанное исключение:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Необработанное отклонение промиса:', reason);
    process.exit(1);
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
    logger.info('Получен сигнал SIGTERM. Завершение работы...');
    process.exit(0);
});

// Handle SIGINT signal
process.on('SIGINT', () => {
    logger.info('Получен сигнал SIGINT. Завершение работы...');
    process.exit(0);
});

// Start the server
const server = app.listen(process.env.PORT || 3000, () => {
    logger.info(`Сервер запущен на порту ${server.address().port}`);
}); 
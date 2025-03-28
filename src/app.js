require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/app');
const { testConnection } = require('./utils/dbUtils');
const { getQueueEvents } = require('./utils/queueUtils');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));
app.use(cors(config.cors));
app.use(session(config.app.session));

// Rate limiting
const limiter = rateLimit(config.security.rateLimit);
app.use(limiter);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', routes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/domains', require('./routes/domains'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/recipients', require('./routes/recipients'));
app.use('/api/users', require('./routes/users'));
app.use('/api/metrics', require('./routes/metrics'));

// Error handling
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('Client connected');
    
    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Metrics endpoint
if (config.monitoring.metrics.enabled) {
    app.get(config.monitoring.metrics.path, async (req, res) => {
        try {
            const metrics = await require('./utils/metricsUtils').getMetrics();
            res.set('Content-Type', 'text/plain');
            res.send(metrics);
        } catch (error) {
            logger.error('Ошибка при получении метрик:', error);
            res.status(500).json({ error: 'Ошибка при получении метрик' });
        }
    });
}

// Initialize application
const initialize = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database
        await sequelize.sync();

        // Initialize queue events
        getQueueEvents();

        // Start server
        app.listen(config.app.port, config.app.host, () => {
            logger.info(`Сервер запущен на http://${config.app.host}:${config.app.port}`);
        });
    } catch (error) {
        logger.error('Ошибка при инициализации приложения:', error);
        process.exit(1);
    }
};

initialize();

module.exports = app; 
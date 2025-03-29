const { redis } = require('./redis');
const { logger } = require('./logger');
const crypto = require('crypto');

// Функция для создания уведомления
const createNotification = async (userId, type, data) => {
    try {
        const notificationId = generateNotificationId();
        const notification = {
            id: notificationId,
            userId,
            type,
            data,
            read: false,
            createdAt: new Date().toISOString()
        };

        await redis.hset(
            `notification:${userId}`,
            notificationId,
            JSON.stringify(notification)
        );

        logger.info('Уведомление создано:', {
            userId,
            notificationId,
            type
        });

        return notification;
    } catch (error) {
        logger.error('Ошибка создания уведомления:', error);
        throw error;
    }
};

// Функция для получения уведомлений пользователя
const getUserNotifications = async (userId, page = 1, limit = 20) => {
    try {
        const notifications = await redis.hgetall(`notification:${userId}`);
        const sortedNotifications = Object.values(notifications)
            .map(notification => JSON.parse(notification))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            notifications: sortedNotifications.slice(start, end),
            total: sortedNotifications.length,
            page,
            limit
        };
    } catch (error) {
        logger.error('Ошибка получения уведомлений:', error);
        throw error;
    }
};

// Функция для получения непрочитанных уведомлений
const getUnreadNotifications = async (userId) => {
    try {
        const notifications = await redis.hgetall(`notification:${userId}`);
        return Object.values(notifications)
            .map(notification => JSON.parse(notification))
            .filter(notification => !notification.read)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        logger.error('Ошибка получения непрочитанных уведомлений:', error);
        throw error;
    }
};

// Функция для отметки уведомления как прочитанного
const markAsRead = async (userId, notificationId) => {
    try {
        const notification = await redis.hget(`notification:${userId}`, notificationId);
        if (!notification) {
            return false;
        }

        const updatedNotification = {
            ...JSON.parse(notification),
            read: true
        };

        await redis.hset(
            `notification:${userId}`,
            notificationId,
            JSON.stringify(updatedNotification)
        );

        logger.info('Уведомление отмечено как прочитанное:', {
            userId,
            notificationId
        });

        return true;
    } catch (error) {
        logger.error('Ошибка отметки уведомления как прочитанного:', error);
        throw error;
    }
};

// Функция для отметки всех уведомлений как прочитанных
const markAllAsRead = async (userId) => {
    try {
        const notifications = await redis.hgetall(`notification:${userId}`);
        const updates = Object.entries(notifications).map(([id, notification]) => {
            const updatedNotification = {
                ...JSON.parse(notification),
                read: true
            };
            return [id, JSON.stringify(updatedNotification)];
        });

        if (updates.length > 0) {
            await redis.hmset(`notification:${userId}`, updates.flat());
        }

        logger.info('Все уведомления отмечены как прочитанные:', {
            userId
        });

        return true;
    } catch (error) {
        logger.error('Ошибка отметки всех уведомлений как прочитанных:', error);
        throw error;
    }
};

// Функция для удаления уведомления
const deleteNotification = async (userId, notificationId) => {
    try {
        const result = await redis.hdel(`notification:${userId}`, notificationId);
        
        if (result) {
            logger.info('Уведомление удалено:', {
                userId,
                notificationId
            });
            return true;
        }

        return false;
    } catch (error) {
        logger.error('Ошибка удаления уведомления:', error);
        throw error;
    }
};

// Функция для удаления всех уведомлений
const deleteAllNotifications = async (userId) => {
    try {
        await redis.del(`notification:${userId}`);
        logger.info('Все уведомления удалены:', {
            userId
        });
        return true;
    } catch (error) {
        logger.error('Ошибка удаления всех уведомлений:', error);
        throw error;
    }
};

// Функция для получения количества непрочитанных уведомлений
const getUnreadCount = async (userId) => {
    try {
        const notifications = await redis.hgetall(`notification:${userId}`);
        return Object.values(notifications)
            .map(notification => JSON.parse(notification))
            .filter(notification => !notification.read)
            .length;
    } catch (error) {
        logger.error('Ошибка получения количества непрочитанных уведомлений:', error);
        throw error;
    }
};

// Функция для генерации ID уведомления
const generateNotificationId = () => {
    return crypto.randomBytes(16).toString('hex');
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount
}; 
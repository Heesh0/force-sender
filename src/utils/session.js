const { redis } = require('./redis');
const { logger } = require('./logger');
const crypto = require('crypto');
const config = require('../config/app');

// Функция для создания сессии
const createSession = async (userId, data = {}) => {
    try {
        const sessionId = generateSessionId();
        const session = {
            id: sessionId,
            userId,
            data,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        await redis.setex(
            `session:${sessionId}`,
            config.session.ttl,
            JSON.stringify(session)
        );

        // Добавляем сессию в список сессий пользователя
        await redis.sadd(`user:sessions:${userId}`, sessionId);

        logger.info('Сессия создана:', {
            userId,
            sessionId
        });

        return session;
    } catch (error) {
        logger.error('Ошибка создания сессии:', error);
        throw error;
    }
};

// Функция для получения сессии
const getSession = async (sessionId) => {
    try {
        const session = await redis.get(`session:${sessionId}`);
        if (!session) {
            return null;
        }

        const parsedSession = JSON.parse(session);
        
        // Обновляем время последней активности
        parsedSession.lastActivity = new Date().toISOString();
        await redis.setex(
            `session:${sessionId}`,
            config.session.ttl,
            JSON.stringify(parsedSession)
        );

        return parsedSession;
    } catch (error) {
        logger.error('Ошибка получения сессии:', error);
        throw error;
    }
};

// Функция для обновления данных сессии
const updateSession = async (sessionId, data) => {
    try {
        const session = await getSession(sessionId);
        if (!session) {
            return null;
        }

        const updatedSession = {
            ...session,
            data: {
                ...session.data,
                ...data
            },
            lastActivity: new Date().toISOString()
        };

        await redis.setex(
            `session:${sessionId}`,
            config.session.ttl,
            JSON.stringify(updatedSession)
        );

        logger.info('Сессия обновлена:', {
            sessionId
        });

        return updatedSession;
    } catch (error) {
        logger.error('Ошибка обновления сессии:', error);
        throw error;
    }
};

// Функция для удаления сессии
const deleteSession = async (sessionId) => {
    try {
        const session = await getSession(sessionId);
        if (!session) {
            return false;
        }

        await redis.del(`session:${sessionId}`);
        await redis.srem(`user:sessions:${session.userId}`, sessionId);

        logger.info('Сессия удалена:', {
            sessionId,
            userId: session.userId
        });

        return true;
    } catch (error) {
        logger.error('Ошибка удаления сессии:', error);
        throw error;
    }
};

// Функция для очистки устаревших сессий
const cleanupSessions = async () => {
    try {
        const keys = await redis.keys('session:*');
        const now = new Date();

        for (const key of keys) {
            const session = await redis.get(key);
            if (session) {
                const parsedSession = JSON.parse(session);
                const lastActivity = new Date(parsedSession.lastActivity);
                const diff = now - lastActivity;

                if (diff > config.session.ttl * 1000) {
                    await deleteSession(parsedSession.id);
                }
            }
        }

        logger.info('Устаревшие сессии очищены');
        return true;
    } catch (error) {
        logger.error('Ошибка очистки устаревших сессий:', error);
        throw error;
    }
};

// Функция для получения всех сессий пользователя
const getUserSessions = async (userId) => {
    try {
        const sessionIds = await redis.smembers(`user:sessions:${userId}`);
        const sessions = [];

        for (const sessionId of sessionIds) {
            const session = await getSession(sessionId);
            if (session) {
                sessions.push(session);
            }
        }

        return sessions;
    } catch (error) {
        logger.error('Ошибка получения сессий пользователя:', error);
        throw error;
    }
};

// Функция для завершения всех сессий пользователя
const terminateUserSessions = async (userId) => {
    try {
        const sessionIds = await redis.smembers(`user:sessions:${userId}`);
        
        for (const sessionId of sessionIds) {
            await deleteSession(sessionId);
        }

        logger.info('Все сессии пользователя завершены:', {
            userId
        });

        return true;
    } catch (error) {
        logger.error('Ошибка завершения сессий пользователя:', error);
        throw error;
    }
};

// Функция для проверки активности сессии
const isSessionActive = async (sessionId) => {
    try {
        const session = await getSession(sessionId);
        if (!session) {
            return false;
        }

        const lastActivity = new Date(session.lastActivity);
        const now = new Date();
        const diff = now - lastActivity;

        return diff <= config.session.ttl * 1000;
    } catch (error) {
        logger.error('Ошибка проверки активности сессии:', error);
        throw error;
    }
};

// Функция для генерации ID сессии
const generateSessionId = () => {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = {
    createSession,
    getSession,
    updateSession,
    deleteSession,
    cleanupSessions,
    getUserSessions,
    terminateUserSessions,
    isSessionActive
}; 
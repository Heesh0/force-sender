const { logger } = require('../utils/logger');

const checkPermission = (requiredRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Требуется авторизация'
                });
            }

            if (req.user.role !== requiredRole) {
                logger.warn('Access denied:', {
                    userId: req.user.id,
                    userRole: req.user.role,
                    requiredRole: requiredRole,
                    path: req.path
                });

                return res.status(403).json({
                    error: 'Доступ запрещен'
                });
            }

            next();
        } catch (error) {
            logger.error('Permission check error:', error);
            return res.status(500).json({
                error: 'Ошибка проверки прав доступа'
            });
        }
    };
};

module.exports = checkPermission; 
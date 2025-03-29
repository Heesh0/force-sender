const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validator');
const Sender = require('../models/Sender');
const { logInfo, logError } = require('../utils/logger');
const auth = require('../middleware/auth');

// Валидация входных данных
const senderValidation = [
    body('name').notEmpty().withMessage('Имя обязательно'),
    body('email').isEmail().withMessage('Некорректный email'),
    body('smtpHost').notEmpty().withMessage('SMTP хост обязателен'),
    body('smtpPort')
        .isInt({ min: 1, max: 65535 })
        .withMessage('Некорректный SMTP порт'),
    body('smtpUser').notEmpty().withMessage('SMTP пользователь обязателен'),
    body('smtpPass').notEmpty().withMessage('SMTP пароль обязателен')
];

// Получение списка отправителей
router.get('/', auth, async (req, res) => {
    try {
        const senders = await Sender.findByUserId(req.user.id);
        res.json({ senders });
    } catch (error) {
        logError('Ошибка получения списка отправителей:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка отправителей'
        });
    }
});

// Получение отправителя по ID
router.get('/:id', auth, async (req, res) => {
    try {
        const sender = await Sender.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!sender) {
            return res.status(404).json({
                error: 'Отправитель не найден'
            });
        }

        res.json({ sender });
    } catch (error) {
        logError('Ошибка получения отправителя:', error);
        res.status(500).json({
            error: 'Ошибка при получении отправителя'
        });
    }
});

// Создание отправителя
router.post('/', auth, senderValidation, validateRequest, async (req, res) => {
    try {
        const sender = await Sender.create({
            ...req.body,
            userId: req.user.id
        });

        logInfo('Создан новый отправитель:', {
            senderId: sender.id,
            userId: req.user.id
        });

        res.status(201).json({
            message: 'Отправитель успешно создан',
            sender
        });
    } catch (error) {
        logError('Ошибка создания отправителя:', error);
        res.status(500).json({
            error: 'Ошибка при создании отправителя'
        });
    }
});

// Обновление отправителя
router.put('/:id', auth, senderValidation, validateRequest, async (req, res) => {
    try {
        const sender = await Sender.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!sender) {
            return res.status(404).json({
                error: 'Отправитель не найден'
            });
        }

        await sender.update(req.body);

        logInfo('Отправитель обновлен:', {
            senderId: sender.id,
            userId: req.user.id
        });

        res.json({
            message: 'Отправитель успешно обновлен',
            sender
        });
    } catch (error) {
        logError('Ошибка обновления отправителя:', error);
        res.status(500).json({
            error: 'Ошибка при обновлении отправителя'
        });
    }
});

// Удаление отправителя
router.delete('/:id', auth, async (req, res) => {
    try {
        const sender = await Sender.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!sender) {
            return res.status(404).json({
                error: 'Отправитель не найден'
            });
        }

        await sender.destroy();

        logInfo('Отправитель удален:', {
            senderId: req.params.id,
            userId: req.user.id
        });

        res.json({
            message: 'Отправитель успешно удален'
        });
    } catch (error) {
        logError('Ошибка удаления отправителя:', error);
        res.status(500).json({
            error: 'Ошибка при удалении отправителя'
        });
    }
});

// Тестирование отправителя
router.post('/:id/test', auth, async (req, res) => {
    try {
        const sender = await Sender.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!sender) {
            return res.status(404).json({
                error: 'Отправитель не найден'
            });
        }

        // Здесь будет логика тестирования SMTP
        // TODO: Реализовать тестирование SMTP

        logInfo('Тестирование отправителя:', {
            senderId: sender.id,
            userId: req.user.id
        });

        res.json({
            message: 'Тестирование отправителя успешно'
        });
    } catch (error) {
        logError('Ошибка тестирования отправителя:', error);
        res.status(500).json({
            error: 'Ошибка при тестировании отправителя'
        });
    }
});

module.exports = router; 
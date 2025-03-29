const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validator');
const { generateToken } = require('../utils/crypto');
const User = require('../models/User');
const { logInfo, logError } = require('../utils/logger');

// Валидация входных данных
const loginValidation = [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен')
];

const registerValidation = [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Пароль должен содержать минимум 8 символов')
        .matches(/\d/)
        .withMessage('Пароль должен содержать хотя бы одну цифру')
        .matches(/[a-zA-Z]/)
        .withMessage('Пароль должен содержать хотя бы одну букву'),
    body('firstName').optional().isString(),
    body('lastName').optional().isString()
];

// Регистрация
router.post('/register', registerValidation, validateRequest, async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                error: 'Пользователь с таким email уже существует'
            });
        }

        // Создаем нового пользователя
        const user = await User.create({
            email,
            password,
            firstName,
            lastName
        });

        // Генерируем токен
        const token = generateToken(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET
        );

        logInfo('Пользователь зарегистрирован:', {
            userId: user.id,
            email: user.email
        });

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        logError('Ошибка регистрации:', error);
        res.status(500).json({
            error: 'Ошибка при регистрации пользователя'
        });
    }
});

// Вход
router.post('/login', loginValidation, validateRequest, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Ищем пользователя
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'Неверный email или пароль'
            });
        }

        // Проверяем пароль
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Неверный email или пароль'
            });
        }

        // Обновляем время последнего входа
        user.lastLogin = new Date();
        await user.save();

        // Генерируем токен
        const token = generateToken(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET
        );

        logInfo('Пользователь вошел в систему:', {
            userId: user.id,
            email: user.email
        });

        res.json({
            message: 'Успешный вход',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        logError('Ошибка входа:', error);
        res.status(500).json({
            error: 'Ошибка при входе в систему'
        });
    }
});

// Выход
router.post('/logout', async (req, res) => {
    try {
        // В будущем здесь можно добавить логику инвалидации токена
        logInfo('Пользователь вышел из системы:', {
            userId: req.user.id,
            email: req.user.email
        });

        res.json({
            message: 'Успешный выход'
        });
    } catch (error) {
        logError('Ошибка выхода:', error);
        res.status(500).json({
            error: 'Ошибка при выходе из системы'
        });
    }
});

// Получение текущего пользователя
router.get('/me', async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'Пользователь не найден'
            });
        }

        res.json({
            user: user.toJSON()
        });
    } catch (error) {
        logError('Ошибка получения данных пользователя:', error);
        res.status(500).json({
            error: 'Ошибка при получении данных пользователя'
        });
    }
});

module.exports = router; 
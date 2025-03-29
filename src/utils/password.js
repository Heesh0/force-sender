const bcrypt = require('bcryptjs');
const { logger } = require('./logger');

// Функция для хеширования пароля
const hashPassword = async (password, saltRounds = 10) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        logger.info('Пароль захеширован:', {
            saltRounds,
            hashLength: hash.length
        });

        return hash;
    } catch (error) {
        logger.error('Ошибка хеширования пароля:', {
            error: error.message
        });
        throw error;
    }
};

// Функция для проверки пароля
const comparePasswords = async (password, hash) => {
    try {
        const isMatch = await bcrypt.compare(password, hash);

        logger.info('Пароль проверен:', {
            isMatch
        });

        return isMatch;
    } catch (error) {
        logger.error('Ошибка проверки пароля:', {
            error: error.message
        });
        throw error;
    }
};

// Функция для генерации случайного пароля
const generatePassword = (length = 12) => {
    try {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';

        // Гарантируем наличие как минимум одного символа каждого типа
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 20)];

        // Добавляем случайные символы до достижения нужной длины
        while (password.length < length) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Перемешиваем символы
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        logger.info('Сгенерирован случайный пароль:', {
            length: password.length
        });

        return password;
    } catch (error) {
        logger.error('Ошибка генерации пароля:', {
            error: error.message
        });
        throw error;
    }
};

// Функция для проверки сложности пароля
const validatePasswordStrength = (password) => {
    try {
        const errors = [];

        // Проверка длины
        if (password.length < 8) {
            errors.push('Пароль должен содержать минимум 8 символов');
        }

        // Проверка наличия строчных букв
        if (!/[a-z]/.test(password)) {
            errors.push('Пароль должен содержать минимум одну строчную букву');
        }

        // Проверка наличия заглавных букв
        if (!/[A-Z]/.test(password)) {
            errors.push('Пароль должен содержать минимум одну заглавную букву');
        }

        // Проверка наличия цифр
        if (!/[0-9]/.test(password)) {
            errors.push('Пароль должен содержать минимум одну цифру');
        }

        // Проверка наличия специальных символов
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Пароль должен содержать минимум один специальный символ');
        }

        // Проверка на последовательности
        if (/(.)\1{2,}/.test(password)) {
            errors.push('Пароль не должен содержать повторяющиеся символы более 2 раз подряд');
        }

        // Проверка на простые последовательности
        if (/123|abc|qwerty/i.test(password)) {
            errors.push('Пароль не должен содержать простые последовательности');
        }

        const isValid = errors.length === 0;

        logger.info('Проверка сложности пароля:', {
            isValid,
            errors
        });

        return {
            isValid,
            errors
        };
    } catch (error) {
        logger.error('Ошибка проверки сложности пароля:', {
            error: error.message
        });
        throw error;
    }
};

// Функция для проверки истории паролей
const checkPasswordHistory = async (password, hashedPasswords) => {
    try {
        const results = await Promise.all(
            hashedPasswords.map(hash => comparePasswords(password, hash))
        );

        const isUsed = results.some(isMatch => isMatch);

        logger.info('Проверка истории паролей:', {
            isUsed,
            historyLength: hashedPasswords.length
        });

        return isUsed;
    } catch (error) {
        logger.error('Ошибка проверки истории паролей:', {
            error: error.message
        });
        throw error;
    }
};

// Функция для обновления пароля
const updatePassword = async (oldPassword, newPassword, currentHash) => {
    try {
        // Проверяем старый пароль
        const isOldPasswordValid = await comparePasswords(oldPassword, currentHash);
        if (!isOldPasswordValid) {
            throw new Error('Неверный текущий пароль');
        }

        // Проверяем сложность нового пароля
        const { isValid, errors } = validatePasswordStrength(newPassword);
        if (!isValid) {
            throw new Error(`Новый пароль не соответствует требованиям: ${errors.join(', ')}`);
        }

        // Хешируем новый пароль
        const newHash = await hashPassword(newPassword);

        logger.info('Пароль обновлен');

        return newHash;
    } catch (error) {
        logger.error('Ошибка обновления пароля:', {
            error: error.message
        });
        throw error;
    }
};

module.exports = {
    hashPassword,
    comparePasswords,
    generatePassword,
    validatePasswordStrength,
    checkPasswordHistory,
    updatePassword
}; 
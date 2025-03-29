const crypto = require('crypto');
const { logger } = require('./logger');

// Функция для генерации случайной строки
const generateRandomString = (length = 32) => {
    try {
        const result = crypto.randomBytes(length).toString('hex');
        
        logger.info('Сгенерирована случайная строка:', {
            length,
            result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка генерации случайной строки:', {
            error: error.message,
            length
        });
        throw error;
    }
};

// Функция для хеширования строки
const hashString = (str, algorithm = 'sha256') => {
    try {
        const hash = crypto.createHash(algorithm).update(str).digest('hex');
        
        logger.info('Строка захеширована:', {
            algorithm,
            result: hash
        });

        return hash;
    } catch (error) {
        logger.error('Ошибка хеширования строки:', {
            error: error.message,
            algorithm
        });
        throw error;
    }
};

// Функция для сравнения строки с хешем
const compareWithHash = (str, hash, algorithm = 'sha256') => {
    try {
        const calculatedHash = hashString(str, algorithm);
        const result = calculatedHash === hash;

        logger.info('Сравнение строки с хешем:', {
            algorithm,
            result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка сравнения строки с хешем:', {
            error: error.message,
            algorithm
        });
        throw error;
    }
};

// Функция для шифрования строки
const encryptString = (str, key, algorithm = 'aes-256-cbc') => {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(str, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const result = {
            iv: iv.toString('hex'),
            encrypted: encrypted
        };

        logger.info('Строка зашифрована:', {
            algorithm,
            result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка шифрования строки:', {
            error: error.message,
            algorithm
        });
        throw error;
    }
};

// Функция для расшифровки строки
const decryptString = (encrypted, key, iv, algorithm = 'aes-256-cbc') => {
    try {
        const decipher = crypto.createDecipheriv(
            algorithm,
            Buffer.from(key),
            Buffer.from(iv, 'hex')
        );
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        logger.info('Строка расшифрована:', {
            algorithm,
            result: decrypted
        });

        return decrypted;
    } catch (error) {
        logger.error('Ошибка расшифровки строки:', {
            error: error.message,
            algorithm
        });
        throw error;
    }
};

// Функция для генерации ключа
const generateKey = (length = 32) => {
    try {
        const key = crypto.randomBytes(length).toString('hex');
        
        logger.info('Сгенерирован ключ:', {
            length,
            result: key
        });

        return key;
    } catch (error) {
        logger.error('Ошибка генерации ключа:', {
            error: error.message,
            length
        });
        throw error;
    }
};

// Функция для генерации токена
const generateToken = (data, secret, options = {}) => {
    try {
        const {
            algorithm = 'HS256',
            expiresIn = '1h'
        } = options;

        const header = {
            alg: algorithm,
            typ: 'JWT'
        };

        const payload = {
            ...data,
            exp: Math.floor(Date.now() / 1000) + (expiresIn === '1h' ? 3600 : 86400)
        };

        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = crypto
            .createHmac('sha256', secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');

        const token = `${encodedHeader}.${encodedPayload}.${signature}`;

        logger.info('Сгенерирован токен:', {
            algorithm,
            expiresIn,
            result: token
        });

        return token;
    } catch (error) {
        logger.error('Ошибка генерации токена:', {
            error: error.message,
            options
        });
        throw error;
    }
};

// Функция для проверки токена
const verifyToken = (token, secret) => {
    try {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString());
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

        const calculatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');

        const isValid = calculatedSignature === signature && payload.exp > Math.floor(Date.now() / 1000);

        logger.info('Проверка токена:', {
            isValid,
            payload
        });

        return {
            isValid,
            payload
        };
    } catch (error) {
        logger.error('Ошибка проверки токена:', {
            error: error.message
        });
        throw error;
    }
};

// Функция для генерации соли
const generateSalt = (length = 16) => {
    try {
        const salt = crypto.randomBytes(length).toString('hex');
        
        logger.info('Сгенерирована соль:', {
            length,
            result: salt
        });

        return salt;
    } catch (error) {
        logger.error('Ошибка генерации соли:', {
            error: error.message,
            length
        });
        throw error;
    }
};

// Функция для хеширования пароля
const hashPassword = (password, salt) => {
    try {
        const hash = crypto
            .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
            .toString('hex');

        logger.info('Пароль захеширован:', {
            result: hash
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
const verifyPassword = (password, hash, salt) => {
    try {
        const calculatedHash = hashPassword(password, salt);
        const result = calculatedHash === hash;

        logger.info('Проверка пароля:', {
            result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка проверки пароля:', {
            error: error.message
        });
        throw error;
    }
};

module.exports = {
    generateRandomString,
    hashString,
    compareWithHash,
    encryptString,
    decryptString,
    generateKey,
    generateToken,
    verifyToken,
    generateSalt,
    hashPassword,
    verifyPassword
}; 
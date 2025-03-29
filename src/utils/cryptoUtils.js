const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');

// Генерация случайной строки
const generateRandomString = (length = 32) => {
    try {
        return crypto.randomBytes(length).toString('hex');
    } catch (error) {
        logError('Ошибка генерации случайной строки:', error);
        throw error;
    }
};

// Хеширование пароля
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        logError('Ошибка хеширования пароля:', error);
        throw error;
    }
};

// Проверка пароля
const verifyPassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        logError('Ошибка проверки пароля:', error);
        throw error;
    }
};

// Шифрование данных
const encrypt = (data) => {
    try {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(config.security.encryptionKey, 'salt', 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    } catch (error) {
        logError('Ошибка шифрования данных:', error);
        throw error;
    }
};

// Расшифровка данных
const decrypt = (encryptedData) => {
    try {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(config.security.encryptionKey, 'salt', 32);
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        logError('Ошибка расшифровки данных:', error);
        throw error;
    }
};

// Генерация JWT токена
const generateToken = (payload) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + config.security.tokenExpiration;

        return {
            token,
            expires
        };
    } catch (error) {
        logError('Ошибка генерации токена:', error);
        throw error;
    }
};

// Проверка JWT токена
const verifyToken = (token) => {
    try {
        // Здесь будет логика проверки токена
        return true;
    } catch (error) {
        logError('Ошибка проверки токена:', error);
        return false;
    }
};

// Генерация ключа API
const generateApiKey = () => {
    try {
        return crypto.randomBytes(32).toString('base64');
    } catch (error) {
        logError('Ошибка генерации ключа API:', error);
        throw error;
    }
};

// Проверка подписи данных
const verifySignature = (data, signature, publicKey) => {
    try {
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(data);
        return verifier.verify(publicKey, signature, 'base64');
    } catch (error) {
        logError('Ошибка проверки подписи:', error);
        return false;
    }
};

// Создание подписи данных
const createSignature = (data, privateKey) => {
    try {
        const signer = crypto.createSign('RSA-SHA256');
        signer.update(data);
        return signer.sign(privateKey, 'base64');
    } catch (error) {
        logError('Ошибка создания подписи:', error);
        throw error;
    }
};

// Генерация ключевой пары
const generateKeyPair = () => {
    try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        return {
            publicKey,
            privateKey
        };
    } catch (error) {
        logError('Ошибка генерации ключевой пары:', error);
        throw error;
    }
};

// Хеширование файла
const hashFile = async (filePath) => {
    try {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = require('fs').createReadStream(filePath);

            stream.on('error', error => {
                logError('Ошибка хеширования файла:', error);
                reject(error);
            });

            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    } catch (error) {
        logError('Ошибка хеширования файла:', error);
        throw error;
    }
};

module.exports = {
    generateRandomString,
    hashPassword,
    verifyPassword,
    encrypt,
    decrypt,
    generateToken,
    verifyToken,
    generateApiKey,
    verifySignature,
    createSignature,
    generateKeyPair,
    hashFile
}; 
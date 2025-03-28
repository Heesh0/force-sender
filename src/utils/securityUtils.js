const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getConfig } = require('./configUtils');
const logger = require('./logger');

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    } catch (error) {
        logger.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};

const comparePasswords = async (password, hash) => {
    try {
        return bcrypt.compare(password, hash);
    } catch (error) {
        logger.error('Error comparing passwords:', error);
        throw new Error('Failed to compare passwords');
    }
};

const generateToken = (payload) => {
    try {
        const secret = getConfig('jwt.secret');
        const expiresIn = getConfig('jwt.expiresIn');
        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        logger.error('Error generating token:', error);
        throw new Error('Failed to generate token');
    }
};

const verifyToken = (token) => {
    try {
        const secret = getConfig('jwt.secret');
        return jwt.verify(token, secret);
    } catch (error) {
        logger.error('Error verifying token:', error);
        throw new Error('Invalid token');
    }
};

const generateRefreshToken = (payload) => {
    try {
        const secret = getConfig('jwt.secret');
        const expiresIn = getConfig('jwt.refreshTokenExpiresIn');
        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        logger.error('Error generating refresh token:', error);
        throw new Error('Failed to generate refresh token');
    }
};

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const hashResetToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '')
        .trim();
};

const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        throw new Error('Password must be at least 8 characters long');
    }
    if (!hasUpperCase) {
        throw new Error('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        throw new Error('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        throw new Error('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        throw new Error('Password must contain at least one special character');
    }

    return true;
};

const generateApiKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

const hashApiKey = (apiKey) => {
    return crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');
};

const validateApiKey = (apiKey, hashedApiKey) => {
    return hashApiKey(apiKey) === hashedApiKey;
};

const createSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

const encryptData = (data, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

const decryptData = (encryptedData, key) => {
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(key),
        Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};

module.exports = {
    hashPassword,
    comparePasswords,
    generateToken,
    verifyToken,
    generateRefreshToken,
    generateResetToken,
    hashResetToken,
    sanitizeInput,
    validatePassword,
    generateApiKey,
    hashApiKey,
    validateApiKey,
    createSecureToken,
    encryptData,
    decryptData
}; 
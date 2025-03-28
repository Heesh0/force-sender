const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');

const domainController = require('../controllers/domainController');
const mailingController = require('../controllers/mailingController');
const emailController = require('../controllers/emailController');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    }
});

// Валидация для доменов
const domainValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('senderEmail').isEmail().withMessage('Invalid sender email'),
    body('mailFrom').notEmpty().withMessage('Mail from is required'),
    body('apiKey').notEmpty().withMessage('API key is required'),
    body('templateId').notEmpty().withMessage('Template ID is required')
];

// Валидация для рассылок
const mailingValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('domainId').isInt().withMessage('Invalid domain ID'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('templateId').notEmpty().withMessage('Template ID is required'),
    body('totalEmails').isInt({ min: 1 }).withMessage('Total emails must be greater than 0'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date')
];

// Маршруты для доменов
router.get('/api/domains', domainController.getAllDomains);
router.post('/api/domains', domainValidation, domainController.createDomain);
router.get('/api/domains/:id', domainController.getDomainById);
router.put('/api/domains/:id', domainValidation, domainController.updateDomain);
router.delete('/api/domains/:id', domainController.deleteDomain);

// Маршруты для рассылок
router.get('/api/mailings', mailingController.getAllMailings);
router.post('/api/mailings', mailingValidation, mailingController.createMailing);
router.get('/api/mailings/:id', mailingController.getMailingById);
router.put('/api/mailings/:id', mailingValidation, mailingController.updateMailing);
router.post('/api/mailings/:id/pause', mailingController.pauseMailing);
router.post('/api/mailings/:id/resume', mailingController.resumeMailing);
router.post('/api/mailings/:id/stop', mailingController.stopMailing);

// Маршруты для email-адресов
router.get('/api/domains/:domainId/emails', emailController.getEmailsByDomain);
router.post('/api/domains/:domainId/emails/upload', upload.single('file'), emailController.uploadEmails);
router.delete('/api/emails/:id', emailController.deleteEmail);
router.put('/api/emails/:id/status', emailController.updateEmailStatus);
router.get('/api/domains/:domainId/emails/export', emailController.exportEmails);

// Маршрут для главной страницы
router.get('/', (req, res) => {
    res.render('pages/index');
});

module.exports = router; 
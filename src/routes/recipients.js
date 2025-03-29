const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipientController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Все маршруты защищены middleware аутентификации
router.use(auth);

// Получение списка получателей
router.get('/', recipientController.getRecipients);

// Создание нового получателя
router.post('/', recipientController.createRecipient);

// Загрузка получателей из CSV
router.post('/upload', upload.single('file'), recipientController.uploadRecipients);

// Обновление получателя
router.put('/:id', recipientController.updateRecipient);

// Удаление получателя
router.delete('/:id', recipientController.deleteRecipient);

module.exports = router; 
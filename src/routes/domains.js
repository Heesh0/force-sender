const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const auth = require('../middleware/auth');

// Все маршруты защищены middleware аутентификации
router.use(auth);

// Получение списка доменов
router.get('/', domainController.getDomains);

// Создание нового домена
router.post('/', domainController.createDomain);

// Верификация домена
router.post('/:id/verify', domainController.verifyDomain);

// Получение шаблонов для домена
router.get('/:id/templates', domainController.getTemplates);

// Получение деталей шаблона
router.get('/:id/templates/:templateId', domainController.getTemplateDetails);

// Обновление домена
router.put('/:id', domainController.updateDomain);

// Удаление домена
router.delete('/:id', domainController.deleteDomain);

module.exports = router; 
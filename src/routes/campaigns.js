const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Все маршруты защищены middleware аутентификации
router.use(auth);

// Получение списка кампаний
router.get('/', campaignController.getCampaigns);

// Создание новой кампании
router.post('/', campaignController.createCampaign);

// Запуск кампании
router.post('/:id/start', campaignController.startCampaign);

// Остановка кампании
router.post('/:id/stop', campaignController.stopCampaign);

// Удаление кампании
router.delete('/:id', campaignController.deleteCampaign);

// Получение статистики кампании
router.get('/:id/stats', campaignController.getCampaignStats);

module.exports = router; 
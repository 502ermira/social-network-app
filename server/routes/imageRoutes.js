const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/generate-image', imageController.generateImage);
router.get('/favorites', authenticateUser, imageController.getFavorites);
router.post('/favorites', authenticateUser, imageController.saveFavorite);
router.post('/unfavorite', authenticateUser, imageController.unfavorite);

module.exports = router;
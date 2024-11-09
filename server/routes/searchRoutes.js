const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/search', authenticateUser, searchController.searchImages);
router.get('/search-users', authenticateUser, searchController.searchUsers);
router.get('/users/suggestions', authenticateUser, searchController.suggestUsers);

module.exports = router;
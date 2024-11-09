const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/profile', authenticateUser, profileController.getProfile);
router.get('/user/:username', authenticateUser, profileController.getUserProfileByUsername);
router.post('/validate-username', profileController.updateUsername);
router.post('/update-email', profileController.updateEmail);
router.post('/update-username',authenticateUser, profileController.updateUsername);
router.post('/validate-email', profileController.updateEmail);
router.put('/change-password', authenticateUser, profileController.changePassword);
router.put('/profile', authenticateUser, profileController.updateProfile);
router.post('/block/:username', authenticateUser, profileController.blockUser);
router.post('/unblock/:username', authenticateUser, profileController.unblockUser);
router.get('/blocked-users', authenticateUser, profileController.getBlockedUsers);
router.post('/update-theme', authenticateUser, profileController.updateTheme);
router.get('/notifications', authenticateUser, profileController.getNotifications);

module.exports = router;
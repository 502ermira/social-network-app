const express = require('express');
const followController = require('../controllers/followController');
const { authenticateUser } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/follow/:username', authenticateUser, followController.followUser);
router.get('/follow-count/:username', followController.getFollowCount);
router.get('/followers-following/:username', followController.getFollowersAndFollowing);
router.post('/unfollow/:username', authenticateUser, followController.unfollowUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/posts/relevant', authenticateUser, postController.getRelevantPosts);
router.get('/posts/explore', authenticateUser, postController.getPopularizedPosts);
router.post('/share', authenticateUser, postController.postImage);
router.delete('/posts/:postId', authenticateUser, postController.deletePost);
router.get('/user/:username/posts', authenticateUser, postController.getUserPosts);
router.get('/posts/:postId', authenticateUser, postController.getPostById);
router.post('/posts/:postId/like', authenticateUser, postController.likePost);
router.get('/posts/:postId/likes', authenticateUser, postController.getLikesByPostId);
router.get('/posts/:postId/comments', authenticateUser, postController.getCommentsByPostId);
router.post('/posts/:postId/comments', authenticateUser, postController.addCommentToPost);
router.delete('/posts/:postId/comments/:commentId', authenticateUser, postController.deleteComment);
router.post('/posts/:postId/repost', authenticateUser, postController.repostPost);
router.get('/posts/:postId/reposts', authenticateUser, postController.getReposts);
router.get('/user/:username/reposts', authenticateUser, postController.getRepostsByUsername);
router.get('/user/:username/likes', authenticateUser, postController.getLikedPosts);
router.post('/posts/:postId/bookmark', authenticateUser, postController.bookmarkPost);
router.get('/posts/:postId/bookmarks', authenticateUser, postController.getBookmarksNumber);
router.get('/posts/:postId/check-bookmark', authenticateUser, postController.isPostBookmarked);

module.exports = router;
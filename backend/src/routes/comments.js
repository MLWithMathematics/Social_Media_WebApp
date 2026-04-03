/**
 * routes/comments.js
 */

const express = require('express');
const router = express.Router();
const {
  getComments,
  addComment,
  deleteComment,
  likeComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { commentLimiter } = require('../middleware/rateLimiter');

router.get('/post/:postId', getComments);
router.post('/post/:postId', protect, commentLimiter, addComment);
router.delete('/:commentId', protect, deleteComment);
router.post('/:commentId/like', protect, likeComment);

module.exports = router;

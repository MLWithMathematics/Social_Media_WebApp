/**
 * routes/posts.js
 */

const express = require('express');
const router = express.Router();
const {
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  getFeed,
  getExplorePosts,
  toggleBookmark,
  getBookmarks,
  getTrendingHashtags,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPostMedia } = require('../middleware/upload');
const { postLimiter } = require('../middleware/rateLimiter');

// Feed & explore
router.get('/feed', protect, getFeed);
router.get('/explore', optionalAuth, getExplorePosts);

// Bookmarks
router.get('/bookmarks', protect, getBookmarks);

// Trending hashtags
router.get('/trending/hashtags', getTrendingHashtags);

// Post CRUD
router.post('/', protect, postLimiter, uploadPostMedia, createPost);
router.get('/:id', optionalAuth, getPost);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Like / Bookmark toggles
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;

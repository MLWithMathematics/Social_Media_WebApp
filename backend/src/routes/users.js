/**
 * routes/users.js
 */

const express = require('express');
const router = express.Router();
const {
  getProfile,
  getUserPosts,
  updateProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getSuggested,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Suggestions (auth required)
router.get('/suggested', protect, getSuggested);

// Profile routes
router.get('/:username', optionalAuth, getProfile);
router.get('/:username/posts', optionalAuth, getUserPosts);
router.get('/:username/followers', optionalAuth, getFollowers);
router.get('/:username/following', optionalAuth, getFollowing);

// Follow toggle by user ID
router.post('/:id/follow', protect, toggleFollow);

// Update profile
router.patch('/me/profile', protect, uploadAvatar, updateProfile);

module.exports = router;

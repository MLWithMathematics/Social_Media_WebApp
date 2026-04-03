/**
 * routes/search.js
 */

const express = require('express');
const router = express.Router();
const {
  searchUsers,
  searchByHashtag,
  globalSearch,
} = require('../controllers/searchController');

router.get('/users', searchUsers);
router.get('/hashtag/:tag', searchByHashtag);
router.get('/', globalSearch);

module.exports = router;

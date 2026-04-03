/**
 * routes/notifications.js
 */

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All notification routes require auth

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;

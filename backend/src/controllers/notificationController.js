/**
 * controllers/notificationController.js - Get and mark notifications
 */

const Notification = require('../models/Notification');

// ── Get all notifications for current user ────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar name')
      .populate('post', 'media caption')
      .populate('comment', 'text');

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// ── Mark all as read ──────────────────────────────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// ── Mark single notification as read ─────────────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification: notif });
  } catch (err) {
    next(err);
  }
};

// ── Delete a notification ─────────────────────────────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

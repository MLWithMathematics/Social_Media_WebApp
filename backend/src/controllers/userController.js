/**
 * controllers/userController.js - Profile, Follow, Update
 */

const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { cloudinary, avatarStorage } = require('../config/cloudinary');
const { getIO } = require('../utils/socket');

// ── Get user profile by username ──────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username avatar name')
      .populate('following', 'username avatar name');

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get post count
    const postsCount = await Post.countDocuments({ author: user._id });

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.some(
        (f) => f._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      user: {
        ...user.toJSON(),
        postsCount,
        isFollowing,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get user's posts ──────────────────────────────────────────────────────────
exports.getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar name');

    const total = await Post.countDocuments({ author: user._id });

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ── Update profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, website } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website;

    // Handle avatar upload (file comes from multer)
    if (req.file) {
      // Delete old avatar from Cloudinary
      const currentUser = await User.findById(req.user._id);
      if (currentUser.avatar?.publicId) {
        await cloudinary.uploader.destroy(currentUser.avatar.publicId);
      }
      updates.avatar = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};

// ── Follow / Unfollow ─────────────────────────────────────────────────────────
exports.toggleFollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;

    if (targetId === currentUserId.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });

      res.json({ message: 'Unfollowed', isFollowing: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } });

      // Create follow notification
      const notification = await Notification.create({
        recipient: targetId,
        sender: currentUserId,
        type: 'follow',
        message: `${req.user.username} started following you`,
      });

      // Emit real-time notification
      const io = getIO();
      io.to(targetId.toString()).emit('notification', {
        ...notification.toObject(),
        sender: { _id: currentUserId, username: req.user.username, avatar: req.user.avatar },
      });

      res.json({ message: 'Followed', isFollowing: true });
    }
  } catch (err) {
    next(err);
  }
};

// ── Get followers / following lists ───────────────────────────────────────────
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      'followers',
      'username avatar name bio'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ users: user.followers });
  } catch (err) {
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      'following',
      'username avatar name bio'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ users: user.following });
  } catch (err) {
    next(err);
  }
};

// ── Get suggested users ───────────────────────────────────────────────────────
exports.getSuggested = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [...currentUser.following, currentUser._id];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .sort({ followersCount: -1 })
      .limit(5)
      .select('username avatar name bio followers');

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

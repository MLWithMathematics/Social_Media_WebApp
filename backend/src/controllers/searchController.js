/**
 * controllers/searchController.js - Search users and posts by hashtag
 */

const User = require('../models/User');
const Post = require('../models/Post');

// ── Search users by username ──────────────────────────────────────────────────
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [{ username: regex }, { name: regex }],
    })
      .select('username avatar name bio followers')
      .limit(20);

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// ── Search posts by hashtag ───────────────────────────────────────────────────
exports.searchByHashtag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      hashtags: tag.toLowerCase(),
      visibility: 'public',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar name')
      .lean();

    const total = await Post.countDocuments({
      hashtags: tag.toLowerCase(),
      visibility: 'public',
    });

    res.json({ posts, total, hasMore: skip + limit < total });
  } catch (err) {
    next(err);
  }
};

// ── Combined search ───────────────────────────────────────────────────────────
exports.globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    const regex = new RegExp(q.trim(), 'i');

    const [users, posts] = await Promise.all([
      User.find({ $or: [{ username: regex }, { name: regex }] })
        .select('username avatar name')
        .limit(5),
      Post.find({
        $or: [{ caption: regex }, { hashtags: q.toLowerCase().replace('#', '') }],
        visibility: 'public',
      })
        .populate('author', 'username avatar')
        .limit(10),
    ]);

    res.json({ users, posts });
  } catch (err) {
    next(err);
  }
};

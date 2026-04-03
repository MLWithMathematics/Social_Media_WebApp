/**
 * controllers/postController.js - CRUD, likes, feed, bookmarks
 */

const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');
const { getIO } = require('../utils/socket');
const xss = require('xss');

// ── Create Post ───────────────────────────────────────────────────────────────
exports.createPost = async (req, res, next) => {
  try {
    const caption = xss(req.body.caption || '');
    const location = xss(req.body.location || '');

    // Build media array from uploaded files
    const media = (req.files || []).map((file) => ({
      url: file.path,
      publicId: file.filename,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }));

    if (!caption && media.length === 0) {
      return res.status(400).json({ error: 'Post must have a caption or media' });
    }

    const post = await Post.create({
      author: req.user._id,
      caption,
      location,
      media,
    });

    await post.populate('author', 'username avatar name');

    res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    next(err);
  }
};

// ── Get single post ───────────────────────────────────────────────────────────
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar name')
      .populate('likes', 'username avatar');

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isLiked = req.user
      ? post.likes.some((u) => u._id.toString() === req.user._id.toString())
      : false;
    const isBookmarked = req.user
      ? (await User.findById(req.user._id)).bookmarks.includes(post._id)
      : false;

    res.json({ post: { ...post.toJSON(), isLiked, isBookmarked } });
  } catch (err) {
    next(err);
  }
};

// ── Update Post ───────────────────────────────────────────────────────────────
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    post.caption = xss(req.body.caption || post.caption);
    post.location = xss(req.body.location || post.location);
    post.isEdited = true;
    await post.save();

    res.json({ message: 'Post updated', post });
  } catch (err) {
    next(err);
  }
};

// ── Delete Post ───────────────────────────────────────────────────────────────
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete media from Cloudinary
    for (const media of post.media) {
      if (media.publicId) {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type,
        });
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Like / Unlike ─────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'username avatar'
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.addToSet(userId);

      // Notify post owner (not self-like)
      if (post.author._id.toString() !== userId.toString()) {
        const notif = await Notification.create({
          recipient: post.author._id,
          sender: userId,
          type: 'like',
          post: post._id,
          message: `${req.user.username} liked your post`,
        });

        const io = getIO();
        io.to(post.author._id.toString()).emit('notification', {
          ...notif.toObject(),
          sender: { _id: userId, username: req.user.username, avatar: req.user.avatar },
        });
      }
    }

    await post.save();

    // Emit real-time like update to all clients viewing this post
    const io = getIO();
    io.to(`post:${post._id}`).emit('postLike', {
      postId: post._id,
      likesCount: post.likes.length,
      isLiked: !isLiked,
      userId,
    });

    res.json({ likesCount: post.likes.length, isLiked: !isLiked });
  } catch (err) {
    next(err);
  }
};

// ── Feed: posts from followed users ──────────────────────────────────────────
exports.getFeed = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort === 'trending' ? { likesCount: -1 } : { createdAt: -1 };

    // Show posts from followed users + own posts
    const authorIds = [...currentUser.following, currentUser._id];

    const posts = await Post.find({ author: { $in: authorIds } })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar name')
      .lean();

    const bookmarks = currentUser.bookmarks.map((id) => id.toString());

    // Attach isLiked and isBookmarked flags
    const enriched = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some((id) => id.toString() === req.user._id.toString()),
      isBookmarked: bookmarks.includes(post._id.toString()),
      likesCount: post.likes.length,
    }));

    const total = await Post.countDocuments({ author: { $in: authorIds } });
    const hasMore = skip + limit < total;

    res.json({ posts: enriched, hasMore, page, total });
  } catch (err) {
    next(err);
  }
};

// ── Explore: public posts ─────────────────────────────────────────────────────
exports.getExplorePosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ visibility: 'public' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar name')
      .lean();

    const total = await Post.countDocuments({ visibility: 'public' });
    res.json({ posts, hasMore: skip + limit < total });
  } catch (err) {
    next(err);
  }
};

// ── Bookmark / Unbookmark ─────────────────────────────────────────────────────
exports.toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarks.includes(req.params.id);

    if (isBookmarked) {
      user.bookmarks.pull(req.params.id);
    } else {
      user.bookmarks.addToSet(req.params.id);
    }
    await user.save();

    res.json({ isBookmarked: !isBookmarked });
  } catch (err) {
    next(err);
  }
};

// ── Get bookmarked posts ──────────────────────────────────────────────────────
exports.getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'username avatar name' },
      options: { sort: { createdAt: -1 } },
    });

    res.json({ posts: user.bookmarks });
  } catch (err) {
    next(err);
  }
};

// ── Trending hashtags ─────────────────────────────────────────────────────────
exports.getTrendingHashtags = async (req, res, next) => {
  try {
    const trending = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ hashtags: trending });
  } catch (err) {
    next(err);
  }
};

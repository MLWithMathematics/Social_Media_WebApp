/**
 * controllers/commentController.js - Comment CRUD, nested replies
 */

const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { getIO } = require('../utils/socket');
const xss = require('xss');

// ── Get comments for a post ───────────────────────────────────────────────────
exports.getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Only top-level comments
    const comments = await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar name');

    // Attach replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .sort({ createdAt: 1 })
          .populate('author', 'username avatar name');
        return { ...comment.toJSON(), replies };
      })
    );

    const total = await Comment.countDocuments({ post: postId, parentComment: null });

    res.json({ comments: commentsWithReplies, total, hasMore: skip + limit < total });
  } catch (err) {
    next(err);
  }
};

// ── Add comment ───────────────────────────────────────────────────────────────
exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const text = xss(req.body.text || '');
    const { parentComment } = req.body;

    if (!text) return res.status(400).json({ error: 'Comment text is required' });

    const post = await Post.findById(postId).populate('author', 'username');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      text,
      parentComment: parentComment || null,
    });

    // Increment post comments count
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    await comment.populate('author', 'username avatar name');

    // Notify post owner (not self)
    if (post.author._id.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: post.author._id,
        sender: req.user._id,
        type: parentComment ? 'reply' : 'comment',
        post: postId,
        comment: comment._id,
        message: `${req.user.username} ${parentComment ? 'replied to a comment' : 'commented'} on your post`,
      });

      const io = getIO();
      io.to(post.author._id.toString()).emit('notification', {
        ...notif.toObject(),
        sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
      });
    }

    // Broadcast new comment to post room
    const io = getIO();
    io.to(`post:${postId}`).emit('newComment', { comment, postId });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

// ── Delete comment ────────────────────────────────────────────────────────────
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const post = await Post.findById(comment.post).populate('author', '_id');

    // Owner of comment or post can delete
    const isCommentOwner = comment.author.toString() === req.user._id.toString();
    const isPostOwner = post?.author._id.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Also delete replies if this is a top-level comment
    if (!comment.parentComment) {
      const replies = await Comment.find({ parentComment: comment._id });
      await Comment.deleteMany({ parentComment: comment._id });
      await Post.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: -(1 + replies.length) },
      });
    } else {
      await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Like a comment ────────────────────────────────────────────────────────────
exports.likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const isLiked = comment.likes.includes(req.user._id);
    if (isLiked) {
      comment.likes.pull(req.user._id);
    } else {
      comment.likes.addToSet(req.user._id);
    }
    await comment.save();

    res.json({ likesCount: comment.likes.length, isLiked: !isLiked });
  } catch (err) {
    next(err);
  }
};

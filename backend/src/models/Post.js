/**
 * models/Post.js - Post schema with likes, media, hashtags
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caption: {
      type: String,
      maxlength: [2200, 'Caption cannot exceed 2200 characters'],
      default: '',
    },
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        width: Number,
        height: Number,
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hashtags: [{ type: String, lowercase: true, trim: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    location: { type: String, default: '' },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual: likes count
postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// Extract hashtags from caption before saving
postSchema.pre('save', function (next) {
  if (this.isModified('caption')) {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = this.caption.match(hashtagRegex) || [];
    this.hashtags = matches.map((tag) => tag.slice(1).toLowerCase());
  }
  next();
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ caption: 'text' });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);

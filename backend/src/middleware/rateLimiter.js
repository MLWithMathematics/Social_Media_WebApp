/**
 * middleware/rateLimiter.js - Specific rate limiters for sensitive routes
 */

const rateLimit = require('express-rate-limit');

// Auth routes — stricter limit
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many auth attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Post creation
exports.postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'You can only create 5 posts per minute.' },
});

// Comment creation
exports.commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many comments. Slow down!' },
});

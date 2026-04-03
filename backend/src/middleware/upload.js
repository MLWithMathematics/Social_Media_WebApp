/**
 * middleware/upload.js - Multer + Cloudinary upload handlers
 */

const multer = require('multer');
const { postStorage, avatarStorage } = require('../config/cloudinary');

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// For post media (up to 5 files)
const uploadPostMedia = multer({
  storage: postStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
}).array('media', 5);

// For avatar (single file)
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed for avatars'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

// Wrapper to handle multer errors
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = {
  uploadPostMedia: handleUpload(uploadPostMedia),
  uploadAvatar: handleUpload(uploadAvatar),
};

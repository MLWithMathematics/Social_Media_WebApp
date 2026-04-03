/**
 * config/cloudinary.js - Cloudinary setup for media uploads
 */

// 1. Require the root cloudinary package (do NOT append .v2 here)
const cloudinary = require('cloudinary');
const multerCloudinary = require('multer-storage-cloudinary');

// Safe access: works whether it's a named or default export
const CloudinaryStorage =
  multerCloudinary.CloudinaryStorage || multerCloudinary;

// 2. Access .v2 specifically when configuring your credentials
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for post images/videos
const postStorage = new CloudinaryStorage({
  // 3. Pass the root 'cloudinary' object here
  cloudinary: cloudinary, 
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'luminary/posts',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov'],
      transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

// Storage for profile pictures
const avatarStorage = new CloudinaryStorage({
  // Pass the root 'cloudinary' object here too
  cloudinary: cloudinary, 
  params: {
    folder: 'luminary/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  },
});

// 4. Export cloudinary.v2 so the rest of your app can still use the modern API
module.exports = { cloudinary: cloudinary.v2, postStorage, avatarStorage };
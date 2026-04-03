/**
 * config/cloudinary.js - Cloudinary setup for media uploads
 *
 * Fix: multer-storage-cloudinary v4 exports CloudinaryStorage as a named export.
 * Require the whole module and access .CloudinaryStorage to avoid constructor errors.
 */

const cloudinary = require('cloudinary').v2;
const multerCloudinary = require('multer-storage-cloudinary');

// Safe access: works whether it's a named or default export
const CloudinaryStorage =
  multerCloudinary.CloudinaryStorage || multerCloudinary;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for post images/videos
const postStorage = new CloudinaryStorage({
  cloudinary,
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
  cloudinary,
  params: {
    folder: 'luminary/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  },
});

module.exports = { cloudinary, postStorage, avatarStorage };
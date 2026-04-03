/**
 * validations/postValidation.js - Joi schemas for post/comment routes
 */

const Joi = require('joi');

const validatePost = (data) =>
  Joi.object({
    caption: Joi.string().max(2200).optional().allow(''),
    location: Joi.string().max(100).optional().allow(''),
    visibility: Joi.string().valid('public', 'followers', 'private').default('public'),
  }).validate(data);

const validateComment = (data) =>
  Joi.object({
    text: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'Comment cannot be empty',
      'any.required': 'Comment text is required',
    }),
    parentComment: Joi.string().optional().allow(null, ''),
  }).validate(data);

module.exports = { validatePost, validateComment };

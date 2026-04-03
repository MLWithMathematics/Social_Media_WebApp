/**
 * validations/authValidation.js - Joi schemas for auth routes
 */

const Joi = require('joi');

const validateRegister = (data) =>
  Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'any.required': 'Username is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(72).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
    name: Joi.string().max(60).optional().allow(''),
  }).validate(data, { abortEarly: true });

const validateLogin = (data) =>
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(data);

module.exports = { validateRegister, validateLogin };

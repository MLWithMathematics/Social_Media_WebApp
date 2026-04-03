/**
 * utils/generateToken.js - JWT generation and cookie setter
 */

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenCookie = (res, token) => {
  const expiresIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 7);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: expiresIn * 24 * 60 * 60 * 1000,
  });
};

module.exports = { generateToken, sendTokenCookie };

/**
 * controllers/authController.js - Register, Login, Logout, Me
 */

const User = require('../models/User');
const { generateToken, sendTokenCookie } = require('../utils/generateToken');
const { validateRegister, validateLogin } = require('../validations/authValidation');

// ── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password, name } = req.body;

    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} is already taken` });
    }

    const user = await User.create({ username, email, password, name: name || username });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: 0,
        followingCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    // Select password explicitly (it's hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// ── Get current user (me) ─────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username avatar name')
      .populate('following', 'username avatar name');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

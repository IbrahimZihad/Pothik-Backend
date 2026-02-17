const bcrypt = require('bcrypt');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');

// User Registration
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;
    const hash = await bcrypt.hash(password, 10);

    await User.create({
      full_name,
      email,
      password_hash: hash,
      phone,
      role,
    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({ message: "Login successful", token, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'full_name', 'email', 'phone', 'role', 'loyalty_points', 'country', 'street_address', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { full_name, phone, country, street_address } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    await user.update({
      full_name: full_name || user.full_name,
      phone: phone || user.phone,
      country: country || user.country,
      street_address: street_address || user.street_address,
    });

    // Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: ['user_id', 'full_name', 'email', 'phone', 'role', 'country', 'street_address', 'loyalty_points', 'created_at']
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
};

// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: newHash });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password', details: err.message });
  }
};
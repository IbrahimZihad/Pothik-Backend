// src/controllers/admin.controller.js

const { Admin } = require('../models');
const bcrypt = require('bcrypt');

// Create new admin
exports.createAdmin = async (req, res) => {
  try {
    const { full_name, email, password, role, status } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      full_name,
      email,
      password: hashedPassword,
      role: role || 'admin',
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Admin creation failed',
      details: err.message
    });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();

    res.json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    await admin.update(req.body);

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    await admin.destroy();

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Dashboard data retrieved',
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'All bookings retrieved',
      data: []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Approve booking
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Booking ${id} approved`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Assign guide to booking
exports.assignGuide = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Guide assigned to booking ${id}`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Booking ${id} cancelled`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Assign hotel to booking
exports.assignHotel = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Hotel assigned to booking ${id}`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Assign transport to booking
exports.assignTransport = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: `Transport assigned to booking ${id}`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

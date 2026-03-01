// src/controllers/admin.controller.js

const { User, Package, Booking, Guide, Blog } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create new admin
exports.createAdmin = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and password are required',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      full_name,
      email,
      password_hash: hashedPassword, // match field in User model
      role: 'admin',                  // explicitly admin
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Admin creation failed',
      details: err.message,
    });
  }
}

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({ where: { role: 'admin' } });

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
    const admin = await User.findByPk(id);

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
    const admin = await User.findByPk(id);

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
    const admin = await User.findByPk(id);

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

// ================= ADMIN LOGIN =================
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    // find admin in DB
    const admin = await User.findOne({ where: { email, role: 'admin' } });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    //  CREATE ADMIN TOKEN
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email
        },
        token
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    // Total users count (customers)
    const totalUsers = await User.count({ where: { role: 'customer' } });

    // Active packages count
    const activePackages = await Package.count({ where: { is_active: true } });

    // Pending bookings count
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });

    // Ongoing tours (confirmed bookings)
    const ongoingTours = await Booking.count({
      where: { status: 'confirmed' }
    });

    // Custom requests (custom package bookings)
    const customRequests = await Booking.count({
      where: { package_type: 'custom' }
    });

    // Total guides count
    const availableGuides = await Guide.count();

    res.json({
      totalUsers,
      activePackages,
      pendingBookings,
      ongoingTours,
      customRequests,
      availableGuides
    });
  } catch (err) {
    console.error('Dashboard data error:', err);
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

const { Package } = require('../models');

// Create new package
exports.createPackage = async (req, res) => {
  try {
    const { title, description, price, days, nights, location, image } = req.body;

    const pkg = await Package.create({
      title,
      description,
      price,
      days,
      nights,
      location,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: pkg
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Package creation failed',
      details: err.message
    });
  }
};

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();

    res.json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get package by ID
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: pkg
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found'
      });
    }

    await pkg.update(req.body);

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: pkg
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found'
      });
    }

    await pkg.destroy();

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

const { Package, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create new package
exports.createPackage = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      duration_days,
      base_price,
      image,
      is_active,
      Start_Date
    } = req.body;

    const pkg = await Package.create({
      name,
      slug,
      description,
      duration_days,
      base_price,
      image,
      is_active,
      Start_Date
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

// Get all packages with optional filters
// Get all packages with optional filters
exports.getAllPackages = async (req, res) => {
  try {
    // Prevent caching completely
    res.set("Cache-Control", "no-store");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const { name, slug } = req.query;
    let where = {};

    // Filter by name (partial match)
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    // Filter by slug (exact)
    if (slug) {
      where.slug = slug;
    }

    const packages = await Package.findAll({ where });

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

// Get package by Name
exports.getPackageByName = async (req, res) => {
  try {
    const { name } = req.params;
    const pkg = await Package.findOne({
      where: { name: { [Op.like]: `%${name}%` } }
    });

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

// Get package by Slug
exports.getPackageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const pkg = await Package.findOne({ where: { slug } });

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

// Get packages by Month (optional year)
exports.getPackagesByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        error: 'Month query parameter is required'
      });
    }

    let where = {
      [Op.and]: [
        sequelize.where(sequelize.fn('MONTH', sequelize.col('Start_Date')), month)
      ]
    };

    if (year) {
      where[Op.and].push(
        sequelize.where(sequelize.fn('YEAR', sequelize.col('Start_Date')), year)
      );
    }

    const packages = await Package.findAll({ where });

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

// Get packages by exact Date (YYYY-MM-DD)
exports.getPackagesByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date query parameter is required'
      });
    }

    const packages = await Package.findAll({
      where: { Start_Date: date }
    });

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

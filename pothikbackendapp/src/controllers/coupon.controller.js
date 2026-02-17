const { Coupon } = require("../models");
const { Op, Sequelize } = require("sequelize");

// -----------------------------------------------------------------------------
// CREATE COUPON
// -----------------------------------------------------------------------------
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order,
      max_discount,
      valid_from,
      valid_to,
      usage_limit,
    } = req.body;

    // Ensure unique code
    const exists = await Coupon.findOne({ where: { code } });
    if (exists) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code,
      discount_type,
      discount_value,
      min_order,
      max_discount,
      valid_from,
      valid_to,
      usage_limit,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET ALL COUPONS
// -----------------------------------------------------------------------------
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [["coupon_id", "DESC"]] });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET SINGLE COUPON BY ID
// -----------------------------------------------------------------------------
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);

    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET COUPON BY CODE (for applying discounts)
// -----------------------------------------------------------------------------
exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const coupon = await Coupon.findOne({
      where: {
        code,
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        valid_to: { [Op.gte]: new Date() },
        used_count: { [Op.lt]: Sequelize.col("usage_limit") },
      },
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// UPDATE COUPON
// -----------------------------------------------------------------------------
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    await coupon.update(req.body);

    res.json({ success: true, message: "Coupon updated successfully", coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE COUPON
// -----------------------------------------------------------------------------
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    await coupon.destroy();

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// TOGGLE COUPON STATUS (activate/deactivate)
// -----------------------------------------------------------------------------
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    coupon.is_active = !coupon.is_active;
    await coupon.save();

    res.json({
      success: true,
      message: `Coupon is now ${coupon.is_active ? "active" : "inactive"}`,
      coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

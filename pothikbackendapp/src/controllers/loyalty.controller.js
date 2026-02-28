const { LoyaltyHistory, User } = require("../models");

// -----------------------------------------------------------------------------
// ADD LOYALTY POINTS (EARN)
// -----------------------------------------------------------------------------
exports.addPoints = async (req, res) => {
  try {
    const { user_id, points, description } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Add points to user's balance
    user.loyalty_points += points;
    await user.save();

    // Log history
    await LoyaltyHistory.create({
      user_id,
      points_added: points,
      description: description || "Points earned",
    });

    res.status(201).json({
      success: true,
      message: "Points added successfully",
      current_balance: user.loyalty_points,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// DEDUCT LOYALTY POINTS
// -----------------------------------------------------------------------------
exports.deductPoints = async (req, res) => {
  try {
    const { user_id, points, description } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.loyalty_points < points) {
      return res.status(400).json({
        success: false,
        message: "Not enough loyalty points",
      });
    }

    // Deduct points
    user.loyalty_points -= points;
    await user.save();

    // Log history
    await LoyaltyHistory.create({
      user_id,
      points_deducted: points,
      description: description || "Points deducted",
    });

    res.status(201).json({
      success: true,
      message: "Points deducted successfully",
      current_balance: user.loyalty_points,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET LOYALTY HISTORY FOR ALL USERS
// -----------------------------------------------------------------------------
exports.getAllHistory = async (req, res) => {
  try {
    const logs = await LoyaltyHistory.findAll({
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET LOYALTY HISTORY FOR ONE USER
// -----------------------------------------------------------------------------
exports.getUserHistory = async (req, res) => {
  try {
    const { user_id } = req.params;

    const logs = await LoyaltyHistory.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE LOYALTY LOG
// -----------------------------------------------------------------------------
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await LoyaltyHistory.findByPk(id);
    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    await log.destroy();

    res.json({ success: true, message: "Log deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET USER LOYALTY BALANCE + SUMMARY
// -----------------------------------------------------------------------------
exports.getUserBalance = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Aggregate totals from history
    const history = await LoyaltyHistory.findAll({ where: { user_id } });

    const total_earned = history.reduce((sum, h) => sum + (h.points_added || 0), 0);
    const total_spent = history.reduce((sum, h) => sum + (h.points_deducted || 0), 0);

    res.json({
      success: true,
      data: {
        user_id: Number(user_id),
        current_balance: user.loyalty_points,
        total_earned,
        total_spent,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

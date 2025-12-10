/**
 * Title : customSession controller
 * -----------------------------
 * Table : custom_sessions
 * 
 * Build by : Md. Foysal Hossain Khan
 */
const { CustomSession, CustomSelectedService, User } = require("../models");

// ===============================
// CREATE CUSTOM SESSION
// ===============================
exports.createSession = async (req, res) => {
  try {
    const { user_id, travel_from, travel_to, travelers } = req.body;

    const session = await CustomSession.create({
      user_id,
      travel_from,
      travel_to,
      travelers,
    });

    return res.status(201).json({
      message: "Custom session created successfully",
      session,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// ADD SERVICES TO SESSION
// ===============================
exports.addService = async (req, res) => {
  try {
    const { session_id, service_type, service_id, quantity } = req.body;

    const service = await CustomSelectedService.create({
      session_id,
      service_type,
      service_id,
      quantity,
    });

    return res.status(201).json({
      message: "Service added to session",
      service,
    });
  } catch (error) {
    console.error("Error adding service:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// GET SESSION WITH SERVICES
// ===============================
exports.getSessionDetails = async (req, res) => {
  try {
    const { session_id } = req.params;

    const session = await CustomSession.findOne({
      where: { session_id },
      include: [
        {
          model: CustomSelectedService,
          as: "services",
        },
        {
          model: User,
          attributes: ["user_id", "full_name", "email"],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// UPDATE SESSION
// ===============================
exports.updateSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const data = req.body;

    const session = await CustomSession.findByPk(session_id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    await session.update(data);

    return res.json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// DELETE SESSION + ALL SERVICES
// ===============================
exports.deleteSession = async (req, res) => {
  try {
    const { session_id } = req.params;

    await CustomSelectedService.destroy({ where: { session_id } });
    await CustomSession.destroy({ where: { session_id } });

    return res.json({ message: "Session and related services deleted" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// REMOVE ONE SERVICE FROM SESSION
// ===============================
exports.removeService = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CustomSelectedService.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.json({ message: "Service removed successfully" });
  } catch (error) {
    console.error("Error removing service:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// GET ALL SESSIONS (ADMIN)
// ===============================
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await CustomSession.findAll({
      include: [
        {
          model: CustomSelectedService,
          as: "services",
        },
        {
          model: User,
          attributes: ["full_name", "email"],
        },
      ],
    });

    return res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

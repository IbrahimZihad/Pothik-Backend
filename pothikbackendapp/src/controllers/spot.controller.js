/**
 * Title: Spot Controller
 * -------------------------
 * Description: Controller functions for managing spots associated with destinations.
 *
 * Table: spots, destinations
 * 
 * Built by: Asif Mia
 * Date: 10 December 2025
 */

const { Spot, Destination } = require("../models");

// Utility: convert name to slug
const toSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ============================================================================
//                               SPOT CONTROLLERS
// ============================================================================

// -----------------------------------------------------------------------------
// CREATE SPOT (belongs to a destination)
// -----------------------------------------------------------------------------
exports.createSpot = async (req, res) => {
  try {
    const { destination_id } = req.params;
    const { name, slug, description, image } = req.body;

    // Check if destination exists
    const destination = await Destination.findByPk(destination_id);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    const spot = await Spot.create({
      destination_id,
      name,
      slug: slug || toSlug(name),
      description,
      image,
    });

    return res.status(201).json({ success: true, spot });
  } catch (err) {
    console.error("Error creating spot:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET ALL SPOTS
// -----------------------------------------------------------------------------
exports.getAllSpots = async (req, res) => {
  try {
    const spots = await Spot.findAll({
      include: [{ model: Destination, as: "destination" }],
    });

    return res.json({ success: true, spots });
  } catch (err) {
    console.error("Error fetching all spots:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET ALL SPOTS OF A SPECIFIC DESTINATION
// -----------------------------------------------------------------------------
exports.getSpotsByDestination = async (req, res) => {
  try {
    const { destination_id } = req.params;

    const destination = await Destination.findByPk(destination_id);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    const spots = await Spot.findAll({
      where: { destination_id },
    });

    return res.json({ success: true, spots });
  } catch (err) {
    console.error("Error fetching spots:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET SINGLE SPOT BY ID
// -----------------------------------------------------------------------------
exports.getSpotById = async (req, res) => {
  try {
    const { spot_id } = req.params;

    const spot = await Spot.findByPk(spot_id, {
      include: [{ model: Destination, as: "destination" }],
    });

    if (!spot) {
      return res.status(404).json({ success: false, message: "Spot not found" });
    }

    return res.json({ success: true, spot });
  } catch (err) {
    console.error("Error fetching spot by ID:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET SINGLE SPOT BY NAME (slug)
// -----------------------------------------------------------------------------
exports.getSpotByName = async (req, res) => {
  try {
    const { name } = req.params;
    const slug = toSlug(name);

    const spot = await Spot.findOne({
      where: { slug },
      include: [{ model: Destination, as: "destination" }],
    });

    if (!spot) {
      return res.status(404).json({ success: false, message: "Spot not found" });
    }

    return res.json({ success: true, spot });
  } catch (err) {
    console.error("Error fetching spot by name:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// UPDATE SPOT
// -----------------------------------------------------------------------------
exports.updateSpot = async (req, res) => {
  try {
    const { spot_id } = req.params;
    const { name } = req.body;

    // Auto-generate slug if name is updated
    if (name && !req.body.slug) {
      req.body.slug = toSlug(name);
    }

    const [updated] = await Spot.update(req.body, {
      where: { spot_id },
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Spot not found" });
    }

    return res.json({ success: true, message: "Spot updated successfully" });
  } catch (err) {
    console.error("Error updating spot:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// DELETE SPOT
// -----------------------------------------------------------------------------
exports.deleteSpot = async (req, res) => {
  try {
    const { spot_id } = req.params;

    const deleted = await Spot.destroy({
      where: { spot_id },
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Spot not found" });
    }

    return res.json({ success: true, message: "Spot deleted successfully" });
  } catch (err) {
    console.error("Error deleting spot:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

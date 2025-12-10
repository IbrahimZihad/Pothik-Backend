/**
 * Tittle: Destination Controller
 * -------------------------
 * Description:Controller functions for managing destinations and their associated spots.
 *
 * Table: destinations, spots
 * 
 * Build by: Asif Mia
 * 
 * Date: 10 December 2025
 */


const { Destination, Spot } = require("../models");


const toSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


// ============================================================================
//                               DESTINATION CONTROLLERS
// ============================================================================

// -----------------------------------------------------------------------------
// CREATE DESTINATION
// -----------------------------------------------------------------------------
exports.createDestination = async (req, res) => {
  try {
    const { name, slug, description, image } = req.body;

    const destination = await Destination.create({
      name,
      slug,
      description,
      image,
    });

    return res.status(201).json({ success: true, destination });
  } catch (err) {
    console.error("Error creating destination:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// GET ALL DESTINATIONS (with spots)
// -----------------------------------------------------------------------------
exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      include: [{ model: Spot, as: "spots" }],
    });

    return res.json({ success: true, destinations });
  } catch (err) {
    console.error("Error fetching destinations:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.getDestinationByName = async (req, res) => {
  try {
    const { name } = req.params;
    const slug = toSlug(name);

    const destination = await Destination.findOne({
      where: { slug },
      include: [{ model: Spot, as: "spots" }],
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    return res.json({ success: true, destination });
  } catch (err) {
    console.error("Error fetching destination by name:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// -----------------------------------------------------------------------------
// GET SINGLE DESTINATION WITH SPOTS
// -----------------------------------------------------------------------------
exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findByPk(id, {
      include: [{ model: Spot, as: "spots" }],
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    return res.json({ success: true, destination });
  } catch (err) {
    console.error("Error fetching destination:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// UPDATE DESTINATION
// -----------------------------------------------------------------------------
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Destination.update(req.body, {
      where: { destination_id: id },
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    return res.json({ success: true, message: "Destination updated successfully" });
  } catch (err) {
    console.error("Error updating destination:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -----------------------------------------------------------------------------
// DELETE DESTINATION
// -----------------------------------------------------------------------------
exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Destination.destroy({
      where: { destination_id: id },
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    return res.json({ success: true, message: "Destination deleted successfully" });
  } catch (err) {
    console.error("Error deleting destination:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const { Transport, TransportVehicle, User } = require("../models");

// -----------------------------------------------------------------------------
// CREATE TRANSPORT
// -----------------------------------------------------------------------------
exports.createTransport = async (req, res) => {
  try {
    const { owner_id, vehicle_type, model, total_vehicles, capacity, price_per_day } = req.body;

    const transport = await Transport.create({
      owner_id,
      vehicle_type,
      model,
      total_vehicles,
      capacity,
      price_per_day,
    });

    return res.status(201).json({ success: true, transport });
  } catch (err) {
    console.error("Error creating transport:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET ALL TRANSPORTS
// -----------------------------------------------------------------------------
exports.getAllTransports = async (req, res) => {
  try {
    const transports = await Transport.findAll({
      include: [
        {
          model: User,
          as: "User", // must match the alias in the model
          attributes: ["user_id", "full_name", "email"],
          required: false
        },
      ],
    });

    return res.json({ success: true, transports });
  } catch (err) {
    console.error("Error fetching transports:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET SINGLE TRANSPORT WITH VEHICLES
// -----------------------------------------------------------------------------
exports.getTransportById = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await Transport.findByPk(id, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["user_id", "full_name", "email"],
          required: false
        },
        {
          model: TransportVehicle,
          as: "Vehicles",
          required: false
        }
      ],
    });

    if (!transport) return res.status(404).json({ success: false, message: "Transport not found" });

    return res.json({ success: true, transport });
  } catch (err) {
    console.error("Error fetching transport:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// UPDATE TRANSPORT
// -----------------------------------------------------------------------------
exports.updateTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Transport.update(req.body, { where: { transport_id: id } });

    if (!updated) return res.status(404).json({ success: false, message: "Transport not found" });

    return res.json({ success: true, message: "Transport updated successfully" });
  } catch (err) {
    console.error("Error updating transport:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE TRANSPORT
// -----------------------------------------------------------------------------
exports.deleteTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transport.destroy({ where: { transport_id: id } });

    if (!deleted) return res.status(404).json({ success: false, message: "Transport not found" });

    return res.json({ success: true, message: "Transport deleted successfully" });
  } catch (err) {
    console.error("Error deleting transport:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// ============================================================================
//                           VEHICLE CONTROLLERS
// ============================================================================

// -----------------------------------------------------------------------------
// ADD VEHICLE TO A TRANSPORT
// -----------------------------------------------------------------------------
exports.addVehicle = async (req, res) => {
  try {
    const { transport_id } = req.params;
    const { vehicle_number, vehicle_type, model, capacity, status, price_per_day } = req.body;

    const transport = await Transport.findByPk(transport_id);
    if (!transport) return res.status(404).json({ success: false, message: "Transport not found" });

    const vehicle = await TransportVehicle.create({
      transport_id,
      vehicle_number,
      vehicle_type,
      model,
      capacity,
      status,
      price_per_day,
    });

    return res.status(201).json({ success: true, vehicle });
  } catch (err) {
    console.error("Error adding vehicle:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// GET ALL VEHICLES FOR A TRANSPORT
// -----------------------------------------------------------------------------
exports.getVehicles = async (req, res) => {
  try {
    const { transport_id } = req.params;

    const vehicles = await TransportVehicle.findAll({
      where: { transport_id },
    });

    return res.json({ success: true, vehicles });
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// UPDATE VEHICLE
// -----------------------------------------------------------------------------
exports.updateVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const [updated] = await TransportVehicle.update(req.body, { where: { vehicle_id } });

    if (!updated) return res.status(404).json({ success: false, message: "Vehicle not found" });

    return res.json({ success: true, message: "Vehicle updated successfully" });
  } catch (err) {
    console.error("Error updating vehicle:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE VEHICLE
// -----------------------------------------------------------------------------
exports.deleteVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const deleted = await TransportVehicle.destroy({ where: { vehicle_id } });

    if (!deleted) return res.status(404).json({ success: false, message: "Vehicle not found" });

    return res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error("Error deleting vehicle:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
};

const { 
  PackageServices, 
  Package, 
  Hotel, 
  HotelRoom,
  Transport, 
  Guide,
  User,
  sequelize,
  Op
} = require("../models");

const packageServiceController = {

  // Add a single service to a package
  addServiceToPackage: async (req, res) => {
    try {
      const { package_id, service_type, service_id } = req.body;

      const validServiceTypes = ["hotel", "transport", "guide"];
      if (!validServiceTypes.includes(service_type)) {
        return res.status(400).json({ success: false, message: "Invalid service type" });
      }

      const packageExists = await Package.findByPk(package_id);
      if (!packageExists) return res.status(404).json({ success: false, message: "Package not found" });

      let serviceExists;
      switch (service_type) {
        case "hotel": serviceExists = await Hotel.findByPk(service_id); break;
        case "transport": serviceExists = await Transport.findByPk(service_id); break;
        case "guide": serviceExists = await Guide.findByPk(service_id); break;
      }

      if (!serviceExists) return res.status(404).json({ success: false, message: `${service_type} not found` });

      const existingService = await PackageServices.findOne({ where: { package_id, service_type, service_id } });
      if (existingService) return res.status(409).json({ success: false, message: "Service already added to this package" });

      const packageService = await PackageServices.create({ package_id, service_type, service_id });

      res.status(201).json({ success: true, message: "Service added to package successfully", data: packageService });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error adding service to package", error: error.message });
    }
  },

  // Remove service from package
  removeServiceFromPackage: async (req, res) => {
    try {
      const { id } = req.params;
      const packageService = await PackageServices.findByPk(id);
      if (!packageService) return res.status(404).json({ success: false, message: "Package service not found" });

      await packageService.destroy();
      res.status(200).json({ success: true, message: "Service removed successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error removing service", error: error.message });
    }
  },

  // Get all services for a package
  getPackageServices: async (req, res) => {
  try {
    const { package_id } = req.params;
    const { service_type } = req.query;

    // Verify package exists
    const packageExists = await Package.findByPk(package_id);
    if (!packageExists) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    // Build where clause
    const whereClause = { package_id };
    if (service_type) whereClause.service_type = service_type;

    // Fetch package services with service details
    const packageServices = await PackageServices.findAll({
      where: whereClause,
      include: [
        { model: Package, as: "Package" },
        { model: Hotel, as: "HotelService", include: [{ model: HotelRoom, as: "HotelRooms" }, { model: User, as: "User", attributes: ["user_id", "full_name", "email"] }] },
        { model: Transport, as: "TransportService", include: [{ model: User, as: "User", attributes: ["user_id", "full_name", "email"] }] },
        { model: Guide, as: "GuideService", include: [{ model: User, as: "User", attributes: ["user_id", "full_name", "email"] }] },
      ],
    });

    // Map to unified output
    const servicesWithDetails = packageServices.map((ps) => {
      let serviceDetails = null;
      switch (ps.service_type) {
        case "hotel":
          serviceDetails = ps.HotelService;
          break;
        case "transport":
          serviceDetails = ps.TransportService;
          break;
        case "guide":
          serviceDetails = ps.GuideService;
          break;
      }

      return {
        id: ps.id,
        package_id: ps.package_id,
        service_type: ps.service_type,
        service_id: ps.service_id,
        service_details: serviceDetails,
      };
    });

    res.status(200).json({
      success: true,
      count: servicesWithDetails.length,
      data: servicesWithDetails,
    });
  } catch (error) {
    console.error(error); // ALWAYS log for debugging
    res.status(500).json({
      success: false,
      message: "Error fetching package services",
      error: error.message,
    });
  }
},

  // Get packages by service
  getPackagesByService: async (req, res) => {
    try {
      const { service_type, service_id } = req.params;
      const validServiceTypes = ["hotel", "transport", "guide"];
      if (!validServiceTypes.includes(service_type)) return res.status(400).json({ success: false, message: "Invalid service type" });

      let serviceExists;
      switch (service_type) {
        case "hotel": serviceExists = await Hotel.findByPk(service_id); break;
        case "transport": serviceExists = await Transport.findByPk(service_id); break;
        case "guide": serviceExists = await Guide.findByPk(service_id); break;
      }
      if (!serviceExists) return res.status(404).json({ success: false, message: `${service_type} not found` });

      const packageServices = await PackageServices.findAll({
        where: { service_type, service_id },
        include: [{ model: Package, as: "Package" }],
      });

      res.status(200).json({ success: true, count: packageServices.length, data: packageServices });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error fetching packages by service", error: error.message });
    }
  },

  // Bulk add services
  bulkAddServicesToPackage: async (req, res) => {
    try {
      const { package_id, services } = req.body;
      if (!Array.isArray(services) || services.length === 0) return res.status(400).json({ success: false, message: "Services must be non-empty array" });

      const packageExists = await Package.findByPk(package_id);
      if (!packageExists) return res.status(404).json({ success: false, message: "Package not found" });

      const addedServices = [];
      const errors = [];

      for (const s of services) {
        const { service_type, service_id } = s;
        if (!["hotel", "transport", "guide"].includes(service_type)) {
          errors.push({ service_type, service_id, error: "Invalid type" }); continue;
        }

        let serviceExists;
        switch (service_type) {
          case "hotel": serviceExists = await Hotel.findByPk(service_id); break;
          case "transport": serviceExists = await Transport.findByPk(service_id); break;
          case "guide": serviceExists = await Guide.findByPk(service_id); break;
        }
        if (!serviceExists) { errors.push({ service_type, service_id, error: "Service not found" }); continue; }

        const existing = await PackageServices.findOne({ where: { package_id, service_type, service_id } });
        if (existing) { errors.push({ service_type, service_id, error: "Already added" }); continue; }

        const newService = await PackageServices.create({ package_id, service_type, service_id });
        addedServices.push(newService);
      }

      res.status(201).json({ success: true, added_count: addedServices.length, error_count: errors.length, data: { added_services: addedServices, errors } });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error adding services", error: error.message });
    }
  },

  // Update package service
  updatePackageService: async (req, res) => {
    try {
      const { id } = req.params;
      const { service_type, service_id } = req.body;

      const packageService = await PackageServices.findByPk(id);
      if (!packageService) return res.status(404).json({ success: false, message: "Package service not found" });

      if (!["hotel", "transport", "guide"].includes(service_type)) return res.status(400).json({ success: false, message: "Invalid service type" });

      let serviceExists;
      switch (service_type) {
        case "hotel": serviceExists = await Hotel.findByPk(service_id); break;
        case "transport": serviceExists = await Transport.findByPk(service_id); break;
        case "guide": serviceExists = await Guide.findByPk(service_id); break;
      }
      if (!serviceExists) return res.status(404).json({ success: false, message: `${service_type} not found` });

      const duplicate = await PackageServices.findOne({ where: { package_id: packageService.package_id, service_type, service_id, id: { [Op.ne]: id } } });
      if (duplicate) return res.status(409).json({ success: false, message: "Service already added to package" });

      await packageService.update({ service_type, service_id });
      res.status(200).json({ success: true, message: "Package service updated", data: packageService });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error updating service", error: error.message });
    }
  },

  // Package service stats
  getPackageServiceStats: async (req, res) => {
    try {
      const { package_id } = req.params;
      const packageExists = await Package.findByPk(package_id);
      if (!packageExists) return res.status(404).json({ success: false, message: "Package not found" });

      const stats = await PackageServices.findAll({
        where: { package_id },
        attributes: ["service_type", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        group: ["service_type"],
        raw: true
      });

      const formattedStats = { package_id: parseInt(package_id), total_services: 0, hotel_count: 0, transport_count: 0, guide_count: 0 };
      stats.forEach(stat => { formattedStats[`${stat.service_type}_count`] = parseInt(stat.count); formattedStats.total_services += parseInt(stat.count); });

      res.status(200).json({ success: true, data: formattedStats });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error fetching stats", error: error.message });
    }
  },
};

module.exports = packageServiceController;

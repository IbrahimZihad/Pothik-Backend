const { 
  PackageServices, 
  Package, 
  Hotel, 
  HotelRoom,
  Transport, 
  TransportVehicle,
  Guide,
  User 
} = require("../models");
const { Op } = require("sequelize");

const packageServiceController = {
  // Add service to package
  addServiceToPackage: async (req, res) => {
    try {
      const { package_id, service_type, service_id } = req.body;

      // Validate service_type
      const validServiceTypes = ["hotel", "transport", "guide"];
      if (!validServiceTypes.includes(service_type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service type. Must be 'hotel', 'transport', or 'guide'",
        });
      }

      // Verify package exists
      const packageExists = await Package.findByPk(package_id);
      if (!packageExists) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      // Verify service exists based on type
      let serviceExists;
      switch (service_type) {
        case "hotel":
          serviceExists = await Hotel.findByPk(service_id);
          break;
        case "transport":
          serviceExists = await Transport.findByPk(service_id);
          break;
        case "guide":
          serviceExists = await Guide.findByPk(service_id);
          break;
      }

      if (!serviceExists) {
        return res.status(404).json({
          success: false,
          message: `${service_type.charAt(0).toUpperCase() + service_type.slice(1)} not found`,
        });
      }

      // Check if service already added to package
      const existingService = await PackageServices.findOne({
        where: { package_id, service_type, service_id },
      });

      if (existingService) {
        return res.status(409).json({
          success: false,
          message: "Service already added to this package",
        });
      }

      // Create package service relationship
      const packageService = await PackageServices.create({
        package_id,
        service_type,
        service_id,
      });

      res.status(201).json({
        success: true,
        message: "Service added to package successfully",
        data: packageService,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error adding service to package",
        error: error.message,
      });
    }
  },

  // Remove service from package
  removeServiceFromPackage: async (req, res) => {
    try {
      const { id } = req.params;

      const packageService = await PackageServices.findByPk(id);

      if (!packageService) {
        return res.status(404).json({
          success: false,
          message: "Package service relationship not found",
        });
      }

      await packageService.destroy();

      res.status(200).json({
        success: true,
        message: "Service removed from package successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error removing service from package",
        error: error.message,
      });
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
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      const whereClause = { package_id };
      if (service_type) whereClause.service_type = service_type;

      // Get all package services
      const packageServices = await PackageServices.findAll({
        where: whereClause,
        include: [
          {
            model: Package,
            as: "Package",
          },
        ],
      });

      // Manually fetch and attach the actual service details
      const servicesWithDetails = await Promise.all(
        packageServices.map(async (ps) => {
          let serviceDetails = null;

          switch (ps.service_type) {
            case "hotel":
              serviceDetails = await Hotel.findByPk(ps.service_id, {
                include: [
                  { 
                    model: HotelRoom, 
                    as: "HotelRooms" 
                  },
                  {
                    model: User,
                    as: "User",
                    attributes: ["user_id", "username", "email"],
                  },
                ],
              });
              break;
            case "transport":
              serviceDetails = await Transport.findByPk(ps.service_id, {
                include: [
                  {
                    model: User,
                    as: "User",
                    attributes: ["user_id", "username", "email"],
                  },
                ],
              });
              break;
            case "guide":
              serviceDetails = await Guide.findByPk(ps.service_id, {
                include: [
                  {
                    model: User,
                    as: "User",
                    attributes: ["user_id", "username", "email"],
                  },
                ],
              });
              break;
          }

          return {
            id: ps.id,
            package_id: ps.package_id,
            service_type: ps.service_type,
            service_id: ps.service_id,
            service_details: serviceDetails,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: servicesWithDetails.length,
        data: servicesWithDetails,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching package services",
        error: error.message,
      });
    }
  },

  // Get packages by service (find all packages using a specific service)
  getPackagesByService: async (req, res) => {
    try {
      const { service_type, service_id } = req.params;

      // Validate service_type
      const validServiceTypes = ["hotel", "transport", "guide"];
      if (!validServiceTypes.includes(service_type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service type. Must be 'hotel', 'transport', or 'guide'",
        });
      }

      // Verify service exists
      let serviceExists;
      switch (service_type) {
        case "hotel":
          serviceExists = await Hotel.findByPk(service_id);
          break;
        case "transport":
          serviceExists = await Transport.findByPk(service_id);
          break;
        case "guide":
          serviceExists = await Guide.findByPk(service_id);
          break;
      }

      if (!serviceExists) {
        return res.status(404).json({
          success: false,
          message: `${service_type.charAt(0).toUpperCase() + service_type.slice(1)} not found`,
        });
      }

      // Find all package services with this service
      const packageServices = await PackageServices.findAll({
        where: { service_type, service_id },
        include: [
          {
            model: Package,
            as: "Package",
          },
        ],
      });

      res.status(200).json({
        success: true,
        count: packageServices.length,
        data: packageServices,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching packages by service",
        error: error.message,
      });
    }
  },

  // Bulk add services to package
  bulkAddServicesToPackage: async (req, res) => {
    try {
      const { package_id, services } = req.body;
      // services format: [{ service_type: "hotel", service_id: 1 }, { service_type: "guide", service_id: 2 }]

      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Services must be a non-empty array",
        });
      }

      // Verify package exists
      const packageExists = await Package.findByPk(package_id);
      if (!packageExists) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      const addedServices = [];
      const errors = [];

      for (const service of services) {
        const { service_type, service_id } = service;

        // Validate service_type
        const validServiceTypes = ["hotel", "transport", "guide"];
        if (!validServiceTypes.includes(service_type)) {
          errors.push({
            service_type,
            service_id,
            error: "Invalid service type",
          });
          continue;
        }

        // Verify service exists
        let serviceExists;
        try {
          switch (service_type) {
            case "hotel":
              serviceExists = await Hotel.findByPk(service_id);
              break;
            case "transport":
              serviceExists = await Transport.findByPk(service_id);
              break;
            case "guide":
              serviceExists = await Guide.findByPk(service_id);
              break;
          }

          if (!serviceExists) {
            errors.push({
              service_type,
              service_id,
              error: `${service_type} not found`,
            });
            continue;
          }

          // Check for duplicates
          const existingService = await PackageServices.findOne({
            where: { package_id, service_type, service_id },
          });

          if (existingService) {
            errors.push({
              service_type,
              service_id,
              error: "Service already added to package",
            });
            continue;
          }

          // Create package service
          const packageService = await PackageServices.create({
            package_id,
            service_type,
            service_id,
          });

          addedServices.push(packageService);
        } catch (err) {
          errors.push({
            service_type,
            service_id,
            error: err.message,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: "Bulk service addition completed",
        added_count: addedServices.length,
        error_count: errors.length,
        data: {
          added_services: addedServices,
          errors: errors,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error adding services to package",
        error: error.message,
      });
    }
  },

  // Update service in package (replace one service with another)
  updatePackageService: async (req, res) => {
    try {
      const { id } = req.params;
      const { service_type, service_id } = req.body;

      const packageService = await PackageServices.findByPk(id);

      if (!packageService) {
        return res.status(404).json({
          success: false,
          message: "Package service relationship not found",
        });
      }

      // Validate service_type
      const validServiceTypes = ["hotel", "transport", "guide"];
      if (!validServiceTypes.includes(service_type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service type. Must be 'hotel', 'transport', or 'guide'",
        });
      }

      // Verify new service exists
      let serviceExists;
      switch (service_type) {
        case "hotel":
          serviceExists = await Hotel.findByPk(service_id);
          break;
        case "transport":
          serviceExists = await Transport.findByPk(service_id);
          break;
        case "guide":
          serviceExists = await Guide.findByPk(service_id);
          break;
      }

      if (!serviceExists) {
        return res.status(404).json({
          success: false,
          message: `${service_type.charAt(0).toUpperCase() + service_type.slice(1)} not found`,
        });
      }

      // Check if the new service already exists in the package
      const duplicateCheck = await PackageServices.findOne({
        where: {
          package_id: packageService.package_id,
          service_type,
          service_id,
          id: { [Op.ne]: id }, // Exclude current record
        },
      });

      if (duplicateCheck) {
        return res.status(409).json({
          success: false,
          message: "This service is already added to the package",
        });
      }

      await packageService.update({ service_type, service_id });

      res.status(200).json({
        success: true,
        message: "Package service updated successfully",
        data: packageService,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating package service",
        error: error.message,
      });
    }
  },

  // Get service count by type for a package
  getPackageServiceStats: async (req, res) => {
    try {
      const { package_id } = req.params;

      // Verify package exists
      const packageExists = await Package.findByPk(package_id);
      if (!packageExists) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      const stats = await PackageServices.findAll({
        where: { package_id },
        attributes: [
          "service_type",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["service_type"],
        raw: true,
      });

      const formattedStats = {
        package_id: parseInt(package_id),
        total_services: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
        hotel_count: 0,
        transport_count: 0,
        guide_count: 0,
      };

      stats.forEach((stat) => {
        formattedStats[`${stat.service_type}_count`] = parseInt(stat.count);
      });

      res.status(200).json({
        success: true,
        data: formattedStats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching package service statistics",
        error: error.message,
      });
    }
  },
};

module.exports = packageServiceController;
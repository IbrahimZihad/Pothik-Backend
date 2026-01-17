const { PackageDestination, Package, Destination } = require("../models");

const packageDestinationController = {

  // ➤ ADD destination to package
  addDestinationToPackage: async (req, res) => {
    try {
      const { package_id, destination_id } = req.body;

      if (!package_id || !destination_id) {
        return res.status(400).json({ message: "package_id and destination_id are required" });
      }

      const exists = await PackageDestination.findOne({
        where: { package_id, destination_id }
      });

      if (exists) {
        return res.status(409).json({ message: "Destination already linked to this package" });
      }

      const entry = await PackageDestination.create({ package_id, destination_id });

      return res.status(201).json({
        message: "Destination added to package successfully",
        data: entry,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  },


  // ➤ REMOVE destination from package
  removeDestinationFromPackage: async (req, res) => {
    try {
      const { package_id, destination_id } = req.body;

      if (!package_id || !destination_id) {
        return res.status(400).json({ message: "package_id and destination_id are required" });
      }

      const deleted = await PackageDestination.destroy({
        where: { package_id, destination_id }
      });

      if (!deleted) {
        return res.status(404).json({ message: "Relation not found" });
      }

      return res.status(200).json({
        message: "Destination removed from package successfully"
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  },


  // ➤ GET all destinations of a package
  getDestinationsByPackage: async (req, res) => {
    try {
      const { package_id } = req.params;

      const data = await PackageDestination.findAll({
        where: { package_id },
        include: [
          {
            model: Destination,
            attributes: ["destination_id", "name", "description"]
          }
        ]
      });

      return res.status(200).json({
        message: "Destinations fetched",
        count: data.length,
        data
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  },


  // ➤ GET all packages that include a destination (optional)
  getPackagesByDestination: async (req, res) => {
    try {
      const { destination_id } = req.params;

      const data = await PackageDestination.findAll({
        where: { destination_id },
        include: [
          {
            model: Package,
            attributes: ["package_id", "name", "description"]
          }
        ]
      });

      return res.status(200).json({
        message: "Packages fetched",
        count: data.length,
        data
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  },

};

module.exports = packageDestinationController;

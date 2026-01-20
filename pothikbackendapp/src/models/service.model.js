module.exports = (sequelize, DataTypes) => {
  const PackageServices = sequelize.define(
    "PackageServices",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: { type: DataTypes.INTEGER, allowNull: false },
      service_type: { type: DataTypes.ENUM("hotel", "transport", "guide"), allowNull: false },
      service_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "package_services",
      timestamps: false,
    }
  );

  PackageServices.associate = (models) => {
    // Relation to Package
    PackageServices.belongsTo(models.Package, { foreignKey: "package_id", as: "Package" });

    // Optional relations to services (no foreign key constraints)
    PackageServices.belongsTo(models.Hotel, { foreignKey: "service_id", constraints: false, as: "HotelService" });
    PackageServices.belongsTo(models.Transport, { foreignKey: "service_id", constraints: false, as: "TransportService" });
    PackageServices.belongsTo(models.Guide, { foreignKey: "service_id", constraints: false, as: "GuideService" });
  };

  return PackageServices;
};

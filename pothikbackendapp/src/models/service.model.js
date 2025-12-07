module.exports = (sequelize, DataTypes) => {
  const PackageServices = sequelize.define(
    "PackageServices",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: DataTypes.INTEGER,

      service_type: {
        type: DataTypes.ENUM("hotel", "transport", "guide"),
        allowNull: false,
      },

      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "package_services",
      timestamps: false,
    }
  );

  PackageServices.associate = (models) => {
    // Each row belongs to a Package
    PackageServices.belongsTo(models.Package, {
      foreignKey: "package_id",
    });

    // Optional dynamic associations based on service_type
    PackageServices.belongsTo(models.Hotel, {
      foreignKey: "service_id",
      constraints: false,
    });

    PackageServices.belongsTo(models.Transport, {
      foreignKey: "service_id",
      constraints: false,
    });

    PackageServices.belongsTo(models.Guide, {
      foreignKey: "service_id",
      constraints: false,
    });
  };

  return PackageServices;
};

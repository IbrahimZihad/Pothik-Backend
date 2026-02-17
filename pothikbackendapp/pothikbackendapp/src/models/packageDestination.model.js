
module.exports = (sequelize, DataTypes) => {
  const PackageDestination = sequelize.define(
    "PackageDestination",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "packages",
          key: "package_id",
        },
        onDelete: "CASCADE",
      },
      destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "destinations",
          key: "destination_id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "package_destinations",
      timestamps: false,
    }
  );

  PackageDestination.associate = (models) => {

    PackageDestination.belongsTo(models.Package, { foreignKey: "package_id" });
    PackageDestination.belongsTo(models.Destination, { foreignKey: "destination_id" });
  };

  return PackageDestination;
};

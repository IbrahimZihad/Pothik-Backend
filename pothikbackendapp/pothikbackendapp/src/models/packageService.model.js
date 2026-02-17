
module.exports = (sequelize, DataTypes) => {
  const PackageService = sequelize.define(
    "PackageService",
    {
      service_id: {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "package_services",
      timestamps: false,
    }
  );

  PackageService.associate = (models) => {
    PackageService.belongsTo(models.Package, {
      foreignKey: "package_id",
      as: "package",
    });
  };

  return PackageService;
};

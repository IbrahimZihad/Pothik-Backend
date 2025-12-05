
module.exports = (sequelize, DataTypes) => {
  const CustomSelection = sequelize.define(
    "CustomSelection",
    {
      selection_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "custom_selections",
      timestamps: true,
    }
  );

  CustomSelection.associate = (models) => {
    CustomSelection.belongsTo(models.User, { foreignKey: "user_id" });
    CustomSelection.belongsTo(models.Package, { foreignKey: "package_id" });
    CustomSelection.belongsTo(models.PackageService, { foreignKey: "service_id" });
  };

  return CustomSelection;
};

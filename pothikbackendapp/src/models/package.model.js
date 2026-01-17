module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    "Package",
    {
      package_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      duration_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Start_Date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "packages",
      timestamps: false,
    }
  );

  Package.associate = (models) => {
    Package.belongsToMany(models.Destination, {
      through: models.PackageDestination,
      foreignKey: "package_id",
      otherKey: "destination_id",
    });

    Package.hasMany(models.PackageService, {
      foreignKey: "package_id",
    });
  };

  return Package;
};

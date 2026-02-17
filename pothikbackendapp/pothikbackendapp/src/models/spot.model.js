module.exports = (sequelize, DataTypes) => {
  const Spot = sequelize.define(
    "Spot",
    {
      spot_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
      },
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
    },
    {
      tableName: "spots",
      timestamps: false,
    }
  );

  Spot.associate = (models) => {
    // A spot belongs to a destination
    Spot.belongsTo(models.Destination, {
      foreignKey: "destination_id",
      as: "destination",
    });
  };

  return Spot;
};

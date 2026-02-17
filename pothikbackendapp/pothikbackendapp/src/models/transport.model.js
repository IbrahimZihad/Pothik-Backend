module.exports = (sequelize, DataTypes) => {
  const Transport = sequelize.define(
    "Transport",
    {
      transport_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      owner_id: DataTypes.INTEGER,
      vehicle_type: DataTypes.STRING,
      model: DataTypes.STRING,
      total_vehicles: DataTypes.INTEGER,
      capacity: DataTypes.INTEGER,
      price_per_day: DataTypes.DECIMAL(10, 2),
    },
    { tableName: "transports", timestamps: false }
  );

  Transport.associate = (models) => {
    Transport.belongsTo(models.User, { foreignKey: "owner_id" });
  };

  return Transport;
};


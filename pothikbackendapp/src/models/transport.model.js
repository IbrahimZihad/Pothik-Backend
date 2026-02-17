module.exports = (sequelize, DataTypes) => {
  const Transport = sequelize.define(
    "Transport",
    {
      transport_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      owner_id: { type: DataTypes.INTEGER, allowNull: false },
      vehicle_type: { type: DataTypes.STRING, allowNull: false },
      model: { type: DataTypes.STRING },
      total_vehicles: { type: DataTypes.INTEGER },
      capacity: { type: DataTypes.INTEGER },
      price_per_day: { type: DataTypes.DECIMAL(10, 2) },
    },
    {
      tableName: "transports",
      timestamps: false,
    }
  );

  Transport.associate = (models) => {
    // Transport belongs to an owner (User)
    Transport.belongsTo(models.User, { foreignKey: "owner_id", as: "User" });

    // Transport has many vehicles
    Transport.hasMany(models.TransportVehicle, { foreignKey: "transport_id", as: "Vehicles" });
  };

  return Transport;
};

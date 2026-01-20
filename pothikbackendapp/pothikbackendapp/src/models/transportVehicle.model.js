module.exports = (sequelize, DataTypes) => {
  const TransportVehicle = sequelize.define(
    "TransportVehicle",
    {
      vehicle_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      transport_id: DataTypes.INTEGER,
      vehicle_number: DataTypes.STRING,
      vehicle_type: DataTypes.STRING, // Bus, Car, Microbus, etc.
      model: DataTypes.STRING,
      capacity: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM("available", "on_trip", "maintenance"),
        defaultValue: "available",
      },
      price_per_day: DataTypes.DECIMAL(10, 2),
    },
    { tableName: "transport_vehicles", timestamps: false }
  );

  TransportVehicle.associate = (models) => {
    TransportVehicle.belongsTo(models.Transport, { foreignKey: "transport_id" });
  };

  return TransportVehicle;
};

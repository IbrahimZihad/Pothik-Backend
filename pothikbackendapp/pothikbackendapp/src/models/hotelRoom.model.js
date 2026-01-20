module.exports = (sequelize, DataTypes) => {
  const HotelRoom = sequelize.define(
    "HotelRoom",
    {
      room_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      hotel_id: DataTypes.INTEGER,
      room_type: DataTypes.STRING,
      total_rooms: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(10, 2),
    },
    { tableName: "hotel_rooms", timestamps: false }
  );

  HotelRoom.associate = (models) => {
    HotelRoom.belongsTo(models.Hotel, { foreignKey: "hotel_id" });
  };

  return HotelRoom;
};


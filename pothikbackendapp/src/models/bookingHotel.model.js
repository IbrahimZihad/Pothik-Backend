
/**
 * Title : BookingHotel Model
 * -----------------------------
 * Description : Stores hotel + room selections for a booking.
 *
 * Table : booking_services_hotel
 * 
 * Build by : Md. Foysal Hossain Khan

 */

module.exports = (sequelize, DataTypes) => {
  const BookingHotel = sequelize.define(
    "BookingHotel",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      booking_id: { type: DataTypes.INTEGER, allowNull: false },
      hotel_id: { type: DataTypes.INTEGER, allowNull: false },
      room_id: { type: DataTypes.INTEGER, allowNull: false },
      rooms_booked: { type: DataTypes.INTEGER, allowNull: false },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "booking_services_hotel",
      timestamps: false,
    }
  );
  BookingHotel.associate = (models) => {
    BookingHotel.belongsTo(models.Booking, { foreignKey: "booking_id" });
    BookingHotel.belongsTo(models.Hotel, { foreignKey: "hotel_id" });
    BookingHotel.belongsTo(models.HotelRoom, { foreignKey: "room_id" });
  };

  return BookingHotel;
};

/**
 * Tittle : BookingServiceHotel Model
 * -------------------------
 * Description : Stores hotel + room selections for a booking.
 *
 * Table : booking_services_hotel
 * 
 * Build by : Asif Mia
 * 
 * Date : 4 December 2025
 */

module.exports = (sequelize, DataTypes) => {
  const BookingServiceHotel = sequelize.define(
    "BookingServiceHotel",
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

  BookingServiceHotel.associate = (models) => {
    BookingServiceHotel.belongsTo(models.Booking, {
      foreignKey: "booking_id",
    });
    BookingServiceHotel.belongsTo(models.Hotel, {
      foreignKey: "hotel_id",
    });
    BookingServiceHotel.belongsTo(models.HotelRoom, {
      foreignKey: "room_id",
    });
  };

  return BookingServiceHotel;
};

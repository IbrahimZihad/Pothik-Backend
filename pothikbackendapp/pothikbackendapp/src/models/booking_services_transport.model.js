/**
 * Tittle : BookingServiceTransport Model
 * -----------------------------
 * Description : Stores transport booking information for a booking.
 *
 * Table: booking_services_transport
 * 
 * Build by : Asif Mia
 * 
 * Date : 4 December 2025
 */

module.exports = (sequelize, DataTypes) => {
  const BookingServiceTransport = sequelize.define(
    "BookingServiceTransport",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      booking_id: { type: DataTypes.INTEGER, allowNull: false },
      transport_id: { type: DataTypes.INTEGER, allowNull: false },
      vehicles_booked: { type: DataTypes.INTEGER, allowNull: false },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "booking_services_transport",
      timestamps: false,
    }
  );

  BookingServiceTransport.associate = (models) => {
    BookingServiceTransport.belongsTo(models.Booking, {
      foreignKey: "booking_id",
    });
    BookingServiceTransport.belongsTo(models.Transport, {
      foreignKey: "transport_id",
    });
  };

  return BookingServiceTransport;
};

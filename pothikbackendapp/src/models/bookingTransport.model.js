
/**
 * Title : BookingTransport Model
 * -----------------------------
 * Description : Stores transport booking information for a booking.
 *
 * Table: booking_services_transport
 * 
 * Build by : Md.Foysal Hossain Khan
 */

module.exports = (sequelize, DataTypes) => {
  const BookingTransport = sequelize.define(
    "BookingTransport",
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

  BookingTransport.associate = (models) => {
    BookingTransport.belongsTo(models.Booking, { foreignKey: "booking_id" });
    BookingTransport.belongsTo(models.Transport, { foreignKey: "transport_id" });
  };

  return BookingTransport;
};

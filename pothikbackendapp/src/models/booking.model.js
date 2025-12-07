/**
 * Title : Booking Model
 * -----------------------------
 * Description : Stores main booking information.
 *
 * Table: bookings
 * 
 * Build by : Md.Foysal Hossain Khan
 */

module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "Booking",
    {
      booking_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      user_id: { type: DataTypes.INTEGER, allowNull: false }, // customer/user
      package_id: { type: DataTypes.INTEGER, allowNull: true }, // optional for custom booking

      total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },

      journey_date: { type: DataTypes.DATE, allowNull: false },
      booking_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

      status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "bookings",
      timestamps: false,
    }
  );

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: "user_id" });
    Booking.belongsTo(models.Package, { foreignKey: "package_id" });

    // Relations with service tables
    Booking.hasMany(models.BookingServiceGuide, { foreignKey: "booking_id" });
    Booking.hasMany(models.BookingServiceHotel, { foreignKey: "booking_id" });
    Booking.hasMany(models.BookingServiceTransport, { foreignKey: "booking_id" });
  };

  return Booking;
};

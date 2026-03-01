module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    "Booking",
    {
      booking_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      user_id: { type: DataTypes.INTEGER, allowNull: false },
      package_type: { type: DataTypes.ENUM("prebuilt", "custom"), defaultValue: "prebuilt" },
      package_id: { type: DataTypes.INTEGER, allowNull: true },
      session_id: { type: DataTypes.INTEGER, allowNull: true },

      total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      coupon_id: { type: DataTypes.INTEGER, allowNull: true },
      discounted_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

      loyalty_points_used: { type: DataTypes.INTEGER, defaultValue: 0 },
      loyalty_points_earned: { type: DataTypes.INTEGER, defaultValue: 0 },

      status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
        defaultValue: "pending",
      },

      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "bookings",
      timestamps: false,
    }
  );

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: "user_id" });
    Booking.belongsTo(models.Package, { foreignKey: "package_id" });
    Booking.belongsTo(models.Coupon, { foreignKey: "coupon_id" }); // new

    // Relations with service tables
    Booking.hasMany(models.BookingServiceGuide, { foreignKey: "booking_id" });
    Booking.hasMany(models.BookingServiceHotel, { foreignKey: "booking_id" });
    Booking.hasMany(models.BookingServiceTransport, { foreignKey: "booking_id" });
  };

  return Booking;
};

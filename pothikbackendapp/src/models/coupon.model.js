/**
 * Title : BookingCoupon Model
 * -----------------------------
 * Description : Stores which coupon was applied to a booking and the discount amount.
 *
 * Table : booking_coupons
 * 
 * Build by : Md. Foysal Hossain Khan
 */

module.exports = (sequelize, DataTypes) => {
  const BookingCoupon = sequelize.define(
    "BookingCoupon",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      booking_id: { type: DataTypes.INTEGER, allowNull: false },
      coupon_id: { type: DataTypes.INTEGER, allowNull: false },

      discount_applied: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
      tableName: "booking_coupons",
      timestamps: false,
    }
  );

  BookingCoupon.associate = (models) => {
    BookingCoupon.belongsTo(models.Booking, { foreignKey: "booking_id" });
    BookingCoupon.belongsTo(models.Coupon, { foreignKey: "coupon_id" });
  };

  return BookingCoupon;
};

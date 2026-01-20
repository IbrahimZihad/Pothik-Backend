/**
 * Title : Coupon Model
 * -----------------------------
 * Description : Stores information about coupons and discounts.
 *
 * Table: coupons
 *
 * Build by : Md. Foysal Hossain Khan
 */

module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      coupon_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      discount_type: { type: DataTypes.ENUM("percentage", "fixed"), allowNull: false },
      discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      min_order: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      max_discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      valid_from: { type: DataTypes.DATE, allowNull: false },
      valid_to: { type: DataTypes.DATE, allowNull: false },
      usage_limit: { type: DataTypes.INTEGER, defaultValue: 100 },
      used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "coupons",
      timestamps: false,
    }
  );

  Coupon.associate = (models) => {
    // Direct relation: one coupon can be applied to many bookings
    Coupon.hasMany(models.Booking, { foreignKey: "coupon_id" });
  };

  return Coupon;
};

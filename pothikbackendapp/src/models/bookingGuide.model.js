/**
 * Title : BookingGuide Model
 * -----------------------------
 * Description : Stores guide assignment info for a booking.
 *
 * Table: booking_services_guide
 * 
 * Build by : Md.Foysal Hossain Khan
 */

module.exports = (sequelize, DataTypes) => {
  const BookingGuide = sequelize.define(
    "BookingGuide",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      booking_id: { type: DataTypes.INTEGER, allowNull: false },
      guide_id: { type: DataTypes.INTEGER, allowNull: false },
      assigned_from: { type: DataTypes.DATE, allowNull: false },
      assigned_to: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "booking_services_guide",
      timestamps: false,
    }
  );

  BookingGuide.associate = (models) => {
    BookingGuide.belongsTo(models.Booking, { foreignKey: "booking_id" });
    BookingGuide.belongsTo(models.Guide, { foreignKey: "guide_id" });
  };

  return BookingGuide;
};

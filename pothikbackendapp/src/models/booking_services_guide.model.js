/**
 * Tittle:BookingServiceGuide Model
 * -------------------------
 * Description:Stores guide assignments for a booking.
 *
 * Table: booking_services_guide
 * 
 * Build by: Asif Mia
 * 
 * Date: 4 December 2025
 */

module.exports = (sequelize, DataTypes) => {
  const BookingServiceGuide = sequelize.define(
    "BookingServiceGuide",
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

  BookingServiceGuide.associate = (models) => {
    BookingServiceGuide.belongsTo(models.Booking, {
      foreignKey: "booking_id",
    });
    BookingServiceGuide.belongsTo(models.Guide, {
      foreignKey: "guide_id",
    });
  };

  return BookingServiceGuide;
};

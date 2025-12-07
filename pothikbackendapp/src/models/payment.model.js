module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'booking_id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      defaultValue: 'pending',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "payments",
    timestamps: false,
  });

  // -----------------------------
  // 🔗 Define Associations Here
  // -----------------------------
  Payment.associate = (models) => {
    // PAYMENT → BOOKING
    Payment.belongsTo(models.Booking, {
      foreignKey: "booking_id",
      as: "booking",
    });
  };

  return Payment;
};

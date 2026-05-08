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
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'BDT',
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tran_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    val_id: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    bank_tran_id: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    session_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gateway_response: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded'),
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

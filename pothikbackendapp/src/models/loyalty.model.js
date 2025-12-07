/**
 * Title : LoyaltyHistory Model
 * -----------------------------
 * Description : Stores earning and deduction records for user loyalty points.
 *
 * Table : loyalty_history
 *
 * Build by : Md. Foysal Hossain Khan
 */

module.exports = (sequelize, DataTypes) => {
  const LoyaltyHistory = sequelize.define(
    "LoyaltyHistory",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      user_id: { type: DataTypes.INTEGER, allowNull: false },

      points_added: { type: DataTypes.INTEGER, defaultValue: 0 },
      points_deducted: { type: DataTypes.INTEGER, defaultValue: 0 },

      description: { type: DataTypes.STRING(255), allowNull: true },

      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "loyalty_history",
      timestamps: false,
    }
  );

  LoyaltyHistory.associate = (models) => {
    LoyaltyHistory.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return LoyaltyHistory;
};

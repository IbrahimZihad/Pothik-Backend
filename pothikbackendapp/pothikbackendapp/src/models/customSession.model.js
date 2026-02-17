
module.exports = (sequelize, DataTypes) => {
  const CustomSession = sequelize.define(
    "CustomSession",
    {
      session_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      session_data: {
        type: DataTypes.TEXT, 
        allowNull: true,
      },
    },
    {
      tableName: "custom_sessions",
      timestamps: true, 
    }
  );

  CustomSession.associate = (models) => {
    CustomSession.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return CustomSession;
};

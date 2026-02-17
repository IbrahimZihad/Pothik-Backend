module.exports = (sequelize, DataTypes) => {
  const Guide = sequelize.define(
    "Guide",
    {
      guide_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      owner_id: DataTypes.INTEGER,
      full_name: DataTypes.STRING,
      experience: DataTypes.INTEGER,
      price_per_day: DataTypes.DECIMAL(10, 2),
    },
    { tableName: "guides", timestamps: false }
  );

  Guide.associate = (models) => {
    Guide.belongsTo(models.User, { foreignKey: "owner_id" });
  };

  return Guide;
};


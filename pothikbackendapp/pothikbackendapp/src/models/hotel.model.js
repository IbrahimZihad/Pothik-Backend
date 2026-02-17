module.exports = (sequelize, DataTypes) => {
  const Hotel = sequelize.define(
    "Hotel",
    {
      hotel_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      owner_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      location: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
    },
    { tableName: "hotels", timestamps: false }
  );

  Hotel.associate = (models) => {
    Hotel.hasMany(models.HotelRoom, { foreignKey: "hotel_id" });
    Hotel.belongsTo(models.User, { foreignKey: "owner_id" });
  };

  return Hotel;
};


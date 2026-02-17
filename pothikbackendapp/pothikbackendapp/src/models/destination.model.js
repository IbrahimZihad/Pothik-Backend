module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define(
    "Destination",
    {
      destination_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
      },
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
    },
    {
      tableName: "destinations",
      timestamps: false,
    }
  );

  Destination.associate = (models) => {
    // One destination has many spots
    Destination.hasMany(models.Spot, {
      foreignKey: "destination_id",
      as: "spots",
    });
  };

  return Destination;
};

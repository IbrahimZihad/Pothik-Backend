
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Spot = sequelize.define(
  "Spot",
  {
    spot_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    destination_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
  },
  {
    tableName: "spots",
    timestamps: false,
  }
);

module.exports = Spot;

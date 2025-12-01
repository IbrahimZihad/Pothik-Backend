const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Destination = sequelize.define(
  "Destination",
  {
    destination_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
  },
  {
    tableName: "destinations",
    timestamps: false,
  }
);

module.exports = Destination;


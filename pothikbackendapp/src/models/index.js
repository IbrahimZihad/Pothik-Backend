
const Destination = require("./destination.model");
const Spot = require("./spot.model");

Destination.hasMany(Spot, {
  foreignKey: "destination_id",
  as: "spots",
});

Spot.belongsTo(Destination, {
  foreignKey: "destination_id",
  as: "destination",
});

module.exports = { Destination, Spot };

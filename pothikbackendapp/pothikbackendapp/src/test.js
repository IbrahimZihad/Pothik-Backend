const { sequelize, Destination, Spot } = require("./models");

async function test() {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");

    console.log("Models loaded:");
    console.log(Destination === undefined ? "Destination ❌" : "Destination ✔️");
    console.log(Spot === undefined ? "Spot ❌" : "Spot ✔️");
  } catch (err) {
    console.error(err);
  }
}

test();

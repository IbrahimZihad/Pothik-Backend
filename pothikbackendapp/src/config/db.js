// /src/config/db.js

const sequelize = require("./sequelize");
const db = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to Aiven MySQL (SSL enabled)");
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
  }
})();

module.exports = {
  sequelize,
  db,
};



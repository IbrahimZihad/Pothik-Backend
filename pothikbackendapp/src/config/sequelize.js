// /src/config/sequelize.js

const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const config = require("./index");

let sslOptions = {};

if (config.DB_SSL) {
  sslOptions = {
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, "ca.pem")).toString(),
      rejectUnauthorized: true,
    },
  };
}

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: "mysql",
    timezone: "+06:00",
    logging: false,
    dialectOptions: {
      ...sslOptions,
    },
  }
);

module.exports = sequelize;

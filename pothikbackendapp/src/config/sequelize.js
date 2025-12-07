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
      // Keep connection alive
      connectTimeout: 60000, // 60 seconds
    },
    // Connection pool configuration
    pool: {
      max: 5,              // Maximum number of connections
      min: 0,              // Minimum number of connections
      acquire: 60000,      // Maximum time to acquire connection (60 seconds)
      idle: 10000,         // Maximum idle time before releasing (10 seconds)
      evict: 1000,         // Check for idle connections every 1 second
    },
    // Retry on connection errors
    retry: {
      max: 3,              // Retry up to 3 times
    },
  }
);

module.exports = sequelize;

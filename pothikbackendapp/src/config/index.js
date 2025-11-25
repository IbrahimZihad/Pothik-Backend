// /src/config/index.js

require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || 15016,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  DB_SSL: process.env.DB_SSL === "true",

  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  SERVER_PORT: process.env.SERVER_PORT || 5000,
};


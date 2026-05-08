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

  // Email configuration for password reset
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

  SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
  SSLCOMMERZ_STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD,
  SSLCOMMERZ_IS_LIVE: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  SSLCOMMERZ_SUCCESS_URL: process.env.SSLCOMMERZ_SUCCESS_URL,
  SSLCOMMERZ_FAIL_URL: process.env.SSLCOMMERZ_FAIL_URL,
  SSLCOMMERZ_CANCEL_URL: process.env.SSLCOMMERZ_CANCEL_URL,
  SSLCOMMERZ_IPN_URL: process.env.SSLCOMMERZ_IPN_URL,

  POTHIK_FRONTEND_URL: process.env.POTHIK_FRONTEND_URL,
};


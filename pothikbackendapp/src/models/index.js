// /src/models/index.js

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: 'mysql',
    dialectOptions: config.DB_SSL
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    logging: false, // set to true if you want SQL logs
  }
);

const db = {};

// Dynamically read all model files in this folder
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
  )
  .forEach((file) => {
    try {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    } catch (err) {
      console.warn(`Skipping model file "${file}" due to error: ${err.message}`);
    }
  });

// Apply associations if defined in models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

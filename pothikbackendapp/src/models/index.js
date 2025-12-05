const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

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
            const modelModule = require(path.join(__dirname, file));

            // Check if it's a function (old format) or direct model export (new format)
            const model = typeof modelModule === 'function'
                ? modelModule(sequelize, Sequelize.DataTypes)
                : modelModule;

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

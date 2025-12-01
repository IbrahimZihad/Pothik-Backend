// // src/models/index.js
// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const config = require('../config');

// const basename = path.basename(__filename);
// const db = {};

// const sequelize = new Sequelize(
//   config.db.database,
//   config.db.username,
//   config.db.password,
//   {
//     host: config.db.host,
//     port: config.db.port,
//     dialect: config.db.dialect,
//     logging: config.db.logging,
//     pool: config.db.pool,
//     define: {
//       underscored: true,
//       timestamps: true,
//     },
//   }
// );

// const modelsDir = __dirname;

// fs.readdirSync(modelsDir)
//   .filter(
//     (file) =>
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.endsWith('.model.js')
//   )
//   .forEach((file) => {
//     const model = require(path.join(modelsDir, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// // Run associations
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;
// db.models = db;

// module.exports = db;

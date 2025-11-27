const sequelize = require('./sequelize');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('DB Error:', err.message);
  }
})();

module.exports = { sequelize };

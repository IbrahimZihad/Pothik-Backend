const sequelize = require('./sequelize');

// Test connection on startup
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('DB Error:', err.message);
    process.exit(1); // Exit if cannot connect to database
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nClosing database connections...');
  await sequelize.close();
  console.log('Database connections closed');
  process.exit(0);
});

module.exports = { sequelize };

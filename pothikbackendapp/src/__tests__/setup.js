const { sequelize } = require('../config/db');

// Runs once before all tests
beforeAll(async () => {
    await sequelize.authenticate();
});

// Runs once after all tests
afterAll(async () => {
    await sequelize.close();
});
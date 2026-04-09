const { sequelize } = require('../config/db');

// Runs once before all tests
beforeAll(async () => {
    await sequelize.authenticate(); // verify DB connection
});

// Runs once after all tests
afterAll(async () => {
    await sequelize.close(); // close DB so Jest doesn't hang
});
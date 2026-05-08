const { sequelize } = require('../config/db');

process.env.NODE_ENV = 'test';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

jest.setTimeout(10000);

// Runs once before all tests
beforeAll(async () => {
    await sequelize.authenticate();
});

// Runs once after all tests
afterAll(async () => {
    await sequelize.close();
});

/**
 * Jest Test Setup File
 * =====================
 * This file runs before each test suite to configure the test environment.
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Suppress console.log/warn/error during tests to keep output clean
// Comment these out if you need to debug test failures
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Global timeout for slow tests (optional)
jest.setTimeout(10000);

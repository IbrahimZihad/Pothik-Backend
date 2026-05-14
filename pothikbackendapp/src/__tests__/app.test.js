// Mock sslcommerz-lts before app loads — prevents "Cannot find module" error
jest.mock('sslcommerz-lts', () => {
  return jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue({ GatewayPageURL: null }),
  }));
});

jest.mock('../config', () => ({
  SSLCOMMERZ_STORE_ID: '',
  SSLCOMMERZ_STORE_PASSWORD: '',
  SSLCOMMERZ_IS_LIVE: false,
  SSLCOMMERZ_SUCCESS_URL: 'http://localhost/success',
  SSLCOMMERZ_FAIL_URL: 'http://localhost/fail',
  SSLCOMMERZ_CANCEL_URL: 'http://localhost/cancel',
  SSLCOMMERZ_IPN_URL: 'http://localhost/ipn',
  POTHIK_FRONTEND_URL: 'http://localhost:3000',
}));

const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('should return API info', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Pothik Backend API');
  });
});
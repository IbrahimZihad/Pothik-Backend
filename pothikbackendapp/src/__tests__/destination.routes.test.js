const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/destination.controller', () => ({
  getAllDestinations: jest.fn((req, res) =>
    res.status(200).json({ destinations: [] })
  ),
  getDestinationById: jest.fn((req, res) =>
    res.status(200).json({ id: 'dest-1' })
  ),
  createDestination: jest.fn((req, res) =>
    res.status(201).json({ message: 'Destination created' })
  ),
  updateDestination: jest.fn((req, res) =>
    res.status(200).json({ message: 'Destination updated' })
  ),
  deleteDestination: jest.fn((req, res) =>
    res.status(200).json({ message: 'Destination deleted' })
  ),
}));

const routes = require('../routes/destination.routes');
const controller = require('../controllers/destination.controller');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('Destination Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /destinations', () => {
    it('should return all destinations', async () => {
      const res = await request(app).get('/destinations');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('destinations');
    });
  });

  describe('GET /destinations/:id', () => {
    it('should return a destination', async () => {
      const res = await request(app).get('/destinations/dest-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
    });

    it('should return 404 if not found', async () => {
      controller.getDestinationById.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Not found' })
      );

      const res = await request(app).get('/destinations/bad-id');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /destinations', () => {
    it('should create destination', async () => {
      const res = await request(app)
        .post('/destinations')
        .send({ name: 'Cox Bazar' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Destination created' });
    });
  });

  describe('PUT /destinations/:id', () => {
    it('should update destination', async () => {
      const res = await request(app)
        .put('/destinations/dest-1')
        .send({ name: 'Updated' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Destination updated' });
    });
  });

  describe('DELETE /destinations/:id', () => {
    it('should delete destination', async () => {
      const res = await request(app).delete('/destinations/dest-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Destination deleted' });
    });
  });
});
const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/guide.controller', () => ({
  getGuides: jest.fn((req, res) =>
    res.status(200).json({ guides: [] })
  ),
  getGuideById: jest.fn((req, res) =>
    res.status(200).json({ id: 'guide-1' })
  ),
  addGuide: jest.fn((req, res) =>
    res.status(201).json({ message: 'Guide added' })
  ),
  updateGuide: jest.fn((req, res) =>
    res.status(200).json({ message: 'Guide updated' })
  ),
  deleteGuide: jest.fn((req, res) =>
    res.status(200).json({ message: 'Guide deleted' })
  ),
}));

const routes = require('../routes/guide.routes');
const controller = require('../controllers/guide.controller');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('Guide Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /guides', () => {
    it('should return all guides', async () => {
      const res = await request(app).get('/guides');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('guides');
    });
  });

  describe('GET /guides/:id', () => {
    it('should return a guide', async () => {
      const res = await request(app).get('/guides/guide-1');
      expect(res.statusCode).toBe(200);
    });

    it('should return 404 if not found', async () => {
      controller.getGuideById.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Guide not found' })
      );

      const res = await request(app).get('/guides/bad-id');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /guides', () => {
    it('should add a guide', async () => {
      const res = await request(app)
        .post('/guides')
        .send({ name: 'Guide A' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Guide added' });
    });
  });

  describe('PUT /guides/:id', () => {
    it('should update guide', async () => {
      const res = await request(app)
        .put('/guides/guide-1')
        .send({ name: 'Updated' });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /guides/:id', () => {
    it('should delete guide', async () => {
      const res = await request(app).delete('/guides/guide-1');
      expect(res.statusCode).toBe(200);
    });
  });
});
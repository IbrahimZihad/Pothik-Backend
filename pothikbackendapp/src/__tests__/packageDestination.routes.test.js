const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/packageDestination.controller.js', () => ({
  addDestinationToPackage: jest.fn((req, res) =>
    res.status(201).json({ message: 'Destination added to package' })
  ),
  removeDestinationFromPackage: jest.fn((req, res) =>
    res.status(200).json({ message: 'Destination removed from package' })
  ),
  getDestinationsByPackage: jest.fn((req, res) =>
    res.status(200).json({ destinations: [], packageId: req.params.package_id })
  ),
  getPackagesByDestination: jest.fn((req, res) =>
    res.status(200).json({ packages: [], destinationId: req.params.destination_id })
  ),
}));

const routes = require('../routes/packageDestination.routes.js');
const controller = require('../controllers/packageDestination.controller.js');

const app = express();
app.use(express.json());
app.use('/package-destination', routes);

describe('Package-Destination Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Add Destination ─────────────────────────────────────────
  describe('POST /package-destination/add', () => {
    it('should add a destination to a package', async () => {
      const res = await request(app)
        .post('/package-destination/add')
        .send({ packageId: 'pkg-1', destinationId: 'dest-1' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Destination added to package' });
    });
  });

  // ─── Remove Destination ──────────────────────────────────────
  describe('DELETE /package-destination/remove', () => {
    it('should remove a destination from a package', async () => {
      const res = await request(app)
        .delete('/package-destination/remove')
        .send({ packageId: 'pkg-1', destinationId: 'dest-1' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Destination removed from package' });
    });
  });

  // ─── Get Destinations By Package ─────────────────────────────
  describe('GET /package-destination/package/:package_id', () => {
    it('should return destinations for a package', async () => {
      const res = await request(app).get('/package-destination/package/pkg-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('destinations');
      expect(res.body).toHaveProperty('packageId', 'pkg-1');
    });
  });

  // ─── Get Packages By Destination ─────────────────────────────
  describe('GET /package-destination/destination/:destination_id', () => {
    it('should return packages for a destination', async () => {
      const res = await request(app).get('/package-destination/destination/dest-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('packages');
      expect(res.body).toHaveProperty('destinationId', 'dest-1');
    });
  });
});
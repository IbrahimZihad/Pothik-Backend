const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/package.controller.js', () => ({
  createPackage: jest.fn((req, res) =>
    res.status(201).json({ message: 'Package created', package: req.body })
  ),
  getAllPackages: jest.fn((req, res) =>
    res.status(200).json({ packages: [], filters: req.query })
  ),
  getPackageById: jest.fn((req, res) =>
    res.status(200).json({ package: { id: req.params.id } })
  ),
  getPackageByName: jest.fn((req, res) =>
    res.status(200).json({ package: { name: req.params.name } })
  ),
  getPackageBySlug: jest.fn((req, res) =>
    res.status(200).json({ package: { slug: req.params.slug } })
  ),
  getPackagesByMonth: jest.fn((req, res) =>
    res.status(200).json({ packages: [], month: req.query.month, year: req.query.year })
  ),
  getPackagesByDate: jest.fn((req, res) =>
    res.status(200).json({ packages: [], date: req.query.date })
  ),
  updatePackage: jest.fn((req, res) =>
    res.status(200).json({ message: 'Package updated', package: { id: req.params.id, ...req.body } })
  ),
  deletePackage: jest.fn((req, res) =>
    res.status(200).json({ message: 'Package deleted', id: req.params.id })
  ),
}));

const routes = require('../routes/package.routes.js');
const controller = require('../controllers/package.controller.js');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('Package Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Create Package ───────────────────────────────────────────
  describe('POST /packages', () => {
    it('should create a new package', async () => {
      const packageData = { name: 'Beach Getaway', slug: 'beach-getaway', price: 999 };
      const res = await request(app)
        .post('/packages')
        .send(packageData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Package created');
      expect(res.body).toHaveProperty('package');
      expect(controller.createPackage).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get All Packages ─────────────────────────────────────────
  describe('GET /packages', () => {
    it('should return all packages with no filters', async () => {
      const res = await request(app).get('/packages');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('packages');
      expect(Array.isArray(res.body.packages)).toBe(true);
      expect(controller.getAllPackages).toHaveBeenCalledTimes(1);
    });

    it('should return packages with name filter', async () => {
      const res = await request(app).get('/packages?name=Beach');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('filters');
      expect(res.body.filters).toHaveProperty('name', 'Beach');
    });

    it('should return packages with slug filter', async () => {
      const res = await request(app).get('/packages?slug=beach-getaway');

      expect(res.statusCode).toBe(200);
      expect(res.body.filters).toHaveProperty('slug', 'beach-getaway');
    });
  });

  // ─── Get Package By ID ────────────────────────────────────────
  describe('GET /packages/:id', () => {
    it('should return a package by ID', async () => {
      const res = await request(app).get('/packages/pkg-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('package');
      expect(res.body.package).toHaveProperty('id', 'pkg-123');
      expect(controller.getPackageById).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Package By Name ──────────────────────────────────────
  describe('GET /packages/name/:name', () => {
    it('should return a package by name', async () => {
      const res = await request(app).get('/packages/name/Beach Getaway');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('package');
      expect(res.body.package).toHaveProperty('name', 'Beach Getaway');
      expect(controller.getPackageByName).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Package By Slug ──────────────────────────────────────
  describe('GET /packages/slug/:slug', () => {
    it('should return a package by slug', async () => {
      const res = await request(app).get('/packages/slug/beach-getaway');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('package');
      expect(res.body.package).toHaveProperty('slug', 'beach-getaway');
      expect(controller.getPackageBySlug).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Packages By Month ────────────────────────────────────
  describe('GET /packages/month', () => {
    it('should return packages for a given month', async () => {
      const res = await request(app).get('/packages/month?month=3');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('packages');
      expect(res.body).toHaveProperty('month', '3');
      expect(controller.getPackagesByMonth).toHaveBeenCalledTimes(1);
    });

    it('should return packages for a given month and year', async () => {
      const res = await request(app).get('/packages/month?month=3&year=2026');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('month', '3');
      expect(res.body).toHaveProperty('year', '2026');
    });
  });

  // ─── Get Packages By Date ─────────────────────────────────────
  describe('GET /packages/date', () => {
    it('should return packages for a given date', async () => {
      const res = await request(app).get('/packages/date?date=2026-01-16');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('packages');
      expect(res.body).toHaveProperty('date', '2026-01-16');
      expect(controller.getPackagesByDate).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Update Package ───────────────────────────────────────────
  describe('PUT /packages/:id', () => {
    it('should update a package by ID', async () => {
      const updateData = { name: 'Updated Beach Getaway', price: 1099 };
      const res = await request(app)
        .put('/packages/pkg-123')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Package updated');
      expect(res.body.package).toHaveProperty('id', 'pkg-123');
      expect(controller.updatePackage).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Delete Package ───────────────────────────────────────────
  describe('DELETE /packages/:id', () => {
    it('should delete a package by ID', async () => {
      const res = await request(app).delete('/packages/pkg-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Package deleted');
      expect(res.body).toHaveProperty('id', 'pkg-123');
      expect(controller.deletePackage).toHaveBeenCalledTimes(1);
    });
  });
});
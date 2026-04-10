const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/service.controller.js', () => ({
  addServiceToPackage: jest.fn((req, res) =>
    res.status(201).json({ message: 'Service added to package', service: req.body })
  ),
  removeServiceFromPackage: jest.fn((req, res) =>
    res.status(200).json({ message: 'Service removed from package', id: req.params.id })
  ),
  getPackageServices: jest.fn((req, res) =>
    res.status(200).json({
      services: [],
      packageId: req.params.package_id,
      serviceType: req.query.service_type || null,
    })
  ),
  getPackagesByService: jest.fn((req, res) =>
    res.status(200).json({
      packages: [],
      serviceType: req.params.service_type,
      serviceId: req.params.service_id,
    })
  ),
  bulkAddServicesToPackage: jest.fn((req, res) =>
    res.status(201).json({ message: 'Services bulk added', services: req.body })
  ),
  updatePackageService: jest.fn((req, res) =>
    res.status(200).json({ message: 'Service updated', service: { id: req.params.id, ...req.body } })
  ),
  getPackageServiceStats: jest.fn((req, res) =>
    res.status(200).json({ stats: {}, packageId: req.params.package_id })
  ),
}));

const routes = require('../routes/service.routes.js');
const controller = require('../controllers/service.controller.js');

const app = express();
app.use(express.json());
app.use('/package-services', routes);

describe('Package Service Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Add Service To Package ───────────────────────────────────
  describe('POST /package-services/add', () => {
    it('should add a single service to a package', async () => {
      const serviceData = { packageId: 'pkg-1', serviceType: 'hotel', serviceId: 'hotel-1' };
      const res = await request(app)
        .post('/package-services/add')
        .send(serviceData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Service added to package');
      expect(res.body).toHaveProperty('service');
      expect(controller.addServiceToPackage).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Bulk Add Services ────────────────────────────────────────
  describe('POST /package-services/bulk', () => {
    it('should bulk add services to a package', async () => {
      const bulkData = [
        { packageId: 'pkg-1', serviceType: 'hotel', serviceId: 'hotel-1' },
        { packageId: 'pkg-1', serviceType: 'flight', serviceId: 'flight-1' },
      ];
      const res = await request(app)
        .post('/package-services/bulk')
        .send(bulkData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Services bulk added');
      expect(res.body).toHaveProperty('services');
      expect(controller.bulkAddServicesToPackage).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Services By Package ──────────────────────────────────
  describe('GET /package-services/package/:package_id', () => {
    it('should return all services for a package', async () => {
      const res = await request(app).get('/package-services/package/pkg-1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('services');
      expect(res.body).toHaveProperty('packageId', 'pkg-1');
      expect(res.body).toHaveProperty('serviceType', null);
      expect(controller.getPackageServices).toHaveBeenCalledTimes(1);
    });

    it('should return filtered services by service_type query param', async () => {
      const res = await request(app).get('/package-services/package/pkg-1?service_type=hotel');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('packageId', 'pkg-1');
      expect(res.body).toHaveProperty('serviceType', 'hotel');
    });
  });

  // ─── Get Packages By Service ──────────────────────────────────
  describe('GET /package-services/service/:service_type/:service_id', () => {
    it('should return packages that use a specific service', async () => {
      const res = await request(app).get('/package-services/service/hotel/hotel-1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('packages');
      expect(res.body).toHaveProperty('serviceType', 'hotel');
      expect(res.body).toHaveProperty('serviceId', 'hotel-1');
      expect(controller.getPackagesByService).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Package Service Stats ────────────────────────────────
  describe('GET /package-services/stats/:package_id', () => {
    it('should return service stats for a package', async () => {
      const res = await request(app).get('/package-services/stats/pkg-1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body).toHaveProperty('packageId', 'pkg-1');
      expect(controller.getPackageServiceStats).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Update Package Service ───────────────────────────────────
  describe('PUT /package-services/:id', () => {
    it('should update a service in a package', async () => {
      const updateData = { serviceType: 'flight', serviceId: 'flight-2' };
      const res = await request(app)
        .put('/package-services/svc-123')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Service updated');
      expect(res.body.service).toHaveProperty('id', 'svc-123');
      expect(controller.updatePackageService).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Remove Service From Package ──────────────────────────────
  describe('DELETE /package-services/:id', () => {
    it('should remove a service from a package by relationship ID', async () => {
      const res = await request(app).delete('/package-services/svc-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Service removed from package');
      expect(res.body).toHaveProperty('id', 'svc-123');
      expect(controller.removeServiceFromPackage).toHaveBeenCalledTimes(1);
    });
  });
});
const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/transport.controller.js', () => ({
  // Transport controllers
  createTransport: jest.fn((req, res) =>
    res.status(201).json({ message: 'Transport created', transport: req.body })
  ),
  getAllTransports: jest.fn((req, res) =>
    res.status(200).json({ transports: [] })
  ),
  getTransportById: jest.fn((req, res) =>
    res.status(200).json({ transport: { id: req.params.id } })
  ),
  updateTransport: jest.fn((req, res) =>
    res.status(200).json({ message: 'Transport updated', transport: { id: req.params.id, ...req.body } })
  ),
  deleteTransport: jest.fn((req, res) =>
    res.status(200).json({ message: 'Transport deleted', id: req.params.id })
  ),

  // Vehicle controllers
  addVehicle: jest.fn((req, res) =>
    res.status(201).json({ message: 'Vehicle added', transportId: req.params.transport_id, vehicle: req.body })
  ),
  getVehicles: jest.fn((req, res) =>
    res.status(200).json({ vehicles: [], transportId: req.params.transport_id })
  ),
  updateVehicle: jest.fn((req, res) =>
    res.status(200).json({ message: 'Vehicle updated', vehicle: { id: req.params.vehicle_id, ...req.body } })
  ),
  deleteVehicle: jest.fn((req, res) =>
    res.status(200).json({ message: 'Vehicle deleted', id: req.params.vehicle_id })
  ),
}));

const routes = require('../routes/transport.routes.js');
const controller = require('../controllers/transport.controller.js');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('Transport Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================================
  // TRANSPORT ROUTES
  // ============================================================

  // ─── Create Transport ─────────────────────────────────────────
  describe('POST /createTransports', () => {
    it('should create a new transport', async () => {
      const transportData = { name: 'City Express', type: 'bus' };
      const res = await request(app)
        .post('/createTransports')
        .send(transportData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Transport created');
      expect(res.body).toHaveProperty('transport');
      expect(controller.createTransport).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get All Transports ───────────────────────────────────────
  describe('GET /transports', () => {
    it('should return all transports', async () => {
      const res = await request(app).get('/transports');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('transports');
      expect(Array.isArray(res.body.transports)).toBe(true);
      expect(controller.getAllTransports).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get Transport By ID ──────────────────────────────────────
  describe('GET /transports/:id', () => {
    it('should return a transport by ID', async () => {
      const res = await request(app).get('/transports/transport-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('transport');
      expect(res.body.transport).toHaveProperty('id', 'transport-123');
      expect(controller.getTransportById).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Update Transport ─────────────────────────────────────────
  describe('PUT /transports/:id', () => {
    it('should update a transport by ID', async () => {
      const updateData = { name: 'City Express Updated', type: 'minibus' };
      const res = await request(app)
        .put('/transports/transport-123')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Transport updated');
      expect(res.body.transport).toHaveProperty('id', 'transport-123');
      expect(controller.updateTransport).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Delete Transport ─────────────────────────────────────────
  describe('DELETE /transports/:id', () => {
    it('should delete a transport by ID', async () => {
      const res = await request(app).delete('/transports/transport-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Transport deleted');
      expect(res.body).toHaveProperty('id', 'transport-123');
      expect(controller.deleteTransport).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // VEHICLE ROUTES
  // ============================================================

  // ─── Add Vehicle ──────────────────────────────────────────────
  describe('POST /transports/:transport_id/vehicles', () => {
    it('should add a vehicle to a transport', async () => {
      const vehicleData = { type: 'sedan', seats: 4, plateNumber: 'ABC-123' };
      const res = await request(app)
        .post('/transports/transport-123/vehicles')
        .send(vehicleData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Vehicle added');
      expect(res.body).toHaveProperty('transportId', 'transport-123');
      expect(res.body).toHaveProperty('vehicle');
      expect(controller.addVehicle).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Get All Vehicles ─────────────────────────────────────────
  describe('GET /transports/:transport_id/vehicles', () => {
    it('should return all vehicles for a transport', async () => {
      const res = await request(app).get('/transports/transport-123/vehicles');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('vehicles');
      expect(Array.isArray(res.body.vehicles)).toBe(true);
      expect(res.body).toHaveProperty('transportId', 'transport-123');
      expect(controller.getVehicles).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Update Vehicle ───────────────────────────────────────────
  describe('PUT /vehicles/:vehicle_id', () => {
    it('should update a vehicle by ID', async () => {
      const updateData = { seats: 6, plateNumber: 'XYZ-999' };
      const res = await request(app)
        .put('/vehicles/vehicle-123')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Vehicle updated');
      expect(res.body.vehicle).toHaveProperty('id', 'vehicle-123');
      expect(controller.updateVehicle).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Delete Vehicle ───────────────────────────────────────────
  describe('DELETE /vehicles/:vehicle_id', () => {
    it('should delete a vehicle by ID', async () => {
      const res = await request(app).delete('/vehicles/vehicle-123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Vehicle deleted');
      expect(res.body).toHaveProperty('id', 'vehicle-123');
      expect(controller.deleteVehicle).toHaveBeenCalledTimes(1);
    });
  });
});
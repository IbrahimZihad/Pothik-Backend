/**
 * Unit Tests for Transport Controller
 * ======================================
 * Tests: createTransport, getAllTransports, getTransportById,
 *        updateTransport, deleteTransport,
 *        addVehicle, getVehicles, updateVehicle, deleteVehicle
 */

const transportController = require('../controllers/transport.controller');
const { Transport, TransportVehicle, User } = require('../models');

jest.mock('../models', () => ({
  Transport: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  TransportVehicle: {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  User: { name: 'User' },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Transport Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE TRANSPORT
  // ─────────────────────────────────────────────────────────────────────────
  describe('createTransport', () => {
    it('should create transport and return 201', async () => {
      const transport = { transport_id: 1, vehicle_type: 'bus' };
      Transport.create.mockResolvedValue(transport);

      const req = mockRequest({
        owner_id: 1,
        vehicle_type: 'bus',
        model: 'Scania',
        total_vehicles: 5,
        capacity: 40,
        price_per_day: 5000,
      });
      const res = mockResponse();

      await transportController.createTransport(req, res);

      expect(Transport.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, transport });
    });

    it('should return 500 on error', async () => {
      Transport.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({});
      const res = mockResponse();

      await transportController.createTransport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL TRANSPORTS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllTransports', () => {
    it('should return all transports with user info', async () => {
      const transports = [{ transport_id: 1 }];
      Transport.findAll.mockResolvedValue(transports);

      const req = mockRequest();
      const res = mockResponse();

      await transportController.getAllTransports(req, res);

      expect(Transport.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, transports });
    });

    it('should return 500 on error', async () => {
      Transport.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await transportController.getAllTransports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET TRANSPORT BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getTransportById', () => {
    it('should return transport by id', async () => {
      const transport = { transport_id: 1 };
      Transport.findByPk.mockResolvedValue(transport);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await transportController.getTransportById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, transport });
    });

    it('should return 404 if not found', async () => {
      Transport.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await transportController.getTransportById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE TRANSPORT
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateTransport', () => {
    it('should update transport successfully', async () => {
      Transport.update.mockResolvedValue([1]);

      const req = mockRequest({ model: 'Updated' }, { id: 1 });
      const res = mockResponse();

      await transportController.updateTransport(req, res);

      expect(Transport.update).toHaveBeenCalledWith({ model: 'Updated' }, { where: { transport_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Transport updated successfully' });
    });

    it('should return 404 if not found', async () => {
      Transport.update.mockResolvedValue([0]);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await transportController.updateTransport(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE TRANSPORT
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteTransport', () => {
    it('should delete transport successfully', async () => {
      Transport.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await transportController.deleteTransport(req, res);

      expect(Transport.destroy).toHaveBeenCalledWith({ where: { transport_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Transport deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      Transport.destroy.mockResolvedValue(0);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await transportController.deleteTransport(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // VEHICLE CONTROLLERS
  // ─────────────────────────────────────────────────────────────────────────
  describe('addVehicle', () => {
    it('should add vehicle and return 201', async () => {
      Transport.findByPk.mockResolvedValue({ transport_id: 1 });
      const vehicle = { vehicle_id: 1 };
      TransportVehicle.create.mockResolvedValue(vehicle);

      const req = mockRequest(
        { vehicle_number: 'DH-1234', vehicle_type: 'bus', capacity: 40 },
        { transport_id: 1 }
      );
      const res = mockResponse();

      await transportController.addVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, vehicle });
    });

    it('should return 404 if transport not found', async () => {
      Transport.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { transport_id: 999 });
      const res = mockResponse();

      await transportController.addVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getVehicles', () => {
    it('should return vehicles for a transport', async () => {
      const vehicles = [{ vehicle_id: 1 }];
      TransportVehicle.findAll.mockResolvedValue(vehicles);

      const req = mockRequest({}, { transport_id: 1 });
      const res = mockResponse();

      await transportController.getVehicles(req, res);

      expect(TransportVehicle.findAll).toHaveBeenCalledWith({ where: { transport_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, vehicles });
    });
  });

  describe('updateVehicle', () => {
    it('should update vehicle successfully', async () => {
      TransportVehicle.update.mockResolvedValue([1]);

      const req = mockRequest({ capacity: 50 }, { vehicle_id: 1 });
      const res = mockResponse();

      await transportController.updateVehicle(req, res);

      expect(TransportVehicle.update).toHaveBeenCalledWith({ capacity: 50 }, { where: { vehicle_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Vehicle updated successfully' });
    });

    it('should return 404 if not found', async () => {
      TransportVehicle.update.mockResolvedValue([0]);

      const req = mockRequest({}, { vehicle_id: 999 });
      const res = mockResponse();

      await transportController.updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle successfully', async () => {
      TransportVehicle.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { vehicle_id: 1 });
      const res = mockResponse();

      await transportController.deleteVehicle(req, res);

      expect(TransportVehicle.destroy).toHaveBeenCalledWith({ where: { vehicle_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Vehicle deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      TransportVehicle.destroy.mockResolvedValue(0);

      const req = mockRequest({}, { vehicle_id: 999 });
      const res = mockResponse();

      await transportController.deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

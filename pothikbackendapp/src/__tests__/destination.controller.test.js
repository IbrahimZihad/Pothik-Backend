/**
 * Unit Tests for Destination Controller
 * ========================================
 * Tests: createDestination, getAllDestinations, getDestinationByName,
 *        getDestinationById, updateDestination, deleteDestination
 */

const destController = require('../controllers/destination.controller');
const { Destination, Spot } = require('../models');

jest.mock('../models', () => ({
  Destination: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Spot: { name: 'Spot' },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Destination Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE DESTINATION
  // ─────────────────────────────────────────────────────────────────────────
  describe('createDestination', () => {
    it('should create destination and return 201', async () => {
      const dest = { destination_id: 1, name: 'Cox Bazar' };
      Destination.create.mockResolvedValue(dest);

      const req = mockRequest({ name: 'Cox Bazar', slug: 'cox-bazar', description: 'Beach', image: 'img.jpg' });
      const res = mockResponse();

      await destController.createDestination(req, res);

      expect(Destination.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, destination: dest });
    });

    it('should return 500 on error', async () => {
      Destination.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({});
      const res = mockResponse();

      await destController.createDestination(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL DESTINATIONS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllDestinations', () => {
    it('should return all destinations with spots', async () => {
      const destinations = [{ destination_id: 1, name: 'Cox Bazar', spots: [] }];
      Destination.findAll.mockResolvedValue(destinations);

      const req = mockRequest();
      const res = mockResponse();

      await destController.getAllDestinations(req, res);

      expect(Destination.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, destinations });
    });

    it('should return 500 on error', async () => {
      Destination.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await destController.getAllDestinations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET DESTINATION BY NAME
  // ─────────────────────────────────────────────────────────────────────────
  describe('getDestinationByName', () => {
    it('should return destination by name (converted to slug)', async () => {
      const dest = { destination_id: 1, slug: 'cox-bazar' };
      Destination.findOne.mockResolvedValue(dest);

      const req = mockRequest({}, { name: 'Cox Bazar' });
      const res = mockResponse();

      await destController.getDestinationByName(req, res);

      expect(Destination.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { slug: 'cox-bazar' },
      }));
      expect(res.json).toHaveBeenCalledWith({ success: true, destination: dest });
    });

    it('should return 404 if destination not found', async () => {
      Destination.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { name: 'Unknown' });
      const res = mockResponse();

      await destController.getDestinationByName(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET DESTINATION BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getDestinationById', () => {
    it('should return destination by id', async () => {
      const dest = { destination_id: 1 };
      Destination.findByPk.mockResolvedValue(dest);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await destController.getDestinationById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, destination: dest });
    });

    it('should return 404 if not found', async () => {
      Destination.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await destController.getDestinationById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE DESTINATION
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateDestination', () => {
    it('should update destination successfully', async () => {
      Destination.update.mockResolvedValue([1]);

      const req = mockRequest({ name: 'Updated' }, { id: 1 });
      const res = mockResponse();

      await destController.updateDestination(req, res);

      expect(Destination.update).toHaveBeenCalledWith({ name: 'Updated' }, { where: { destination_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Destination updated successfully' });
    });

    it('should return 404 if not found', async () => {
      Destination.update.mockResolvedValue([0]);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await destController.updateDestination(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE DESTINATION
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteDestination', () => {
    it('should delete destination successfully', async () => {
      Destination.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await destController.deleteDestination(req, res);

      expect(Destination.destroy).toHaveBeenCalledWith({ where: { destination_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Destination deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      Destination.destroy.mockResolvedValue(0);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await destController.deleteDestination(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

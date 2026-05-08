/**
 * Unit Tests for Spot Controller
 * =================================
 * Tests: createSpot, getAllSpots, getSpotsByDestination,
 *        getSpotById, getSpotByName, updateSpot, deleteSpot
 */

const spotController = require('../controllers/spot.controller');
const { Spot, Destination } = require('../models');

jest.mock('../models', () => ({
  Spot: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Destination: {
    findByPk: jest.fn(),
    name: 'Destination',
  },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Spot Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE SPOT
  // ─────────────────────────────────────────────────────────────────────────
  describe('createSpot', () => {
    it('should create spot and return 201', async () => {
      Destination.findByPk.mockResolvedValue({ destination_id: 1 });
      const spot = { spot_id: 1, name: 'Laboni Beach' };
      Spot.create.mockResolvedValue(spot);

      const req = mockRequest(
        { name: 'Laboni Beach', description: 'Beautiful beach', image: 'img.jpg' },
        { destination_id: 1 }
      );
      const res = mockResponse();

      await spotController.createSpot(req, res);

      expect(Destination.findByPk).toHaveBeenCalledWith(1);
      expect(Spot.create).toHaveBeenCalledWith(expect.objectContaining({
        destination_id: 1,
        name: 'Laboni Beach',
        slug: 'laboni-beach',
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 if destination not found', async () => {
      Destination.findByPk.mockResolvedValue(null);

      const req = mockRequest({ name: 'Spot' }, { destination_id: 999 });
      const res = mockResponse();

      await spotController.createSpot(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should use provided slug if given', async () => {
      Destination.findByPk.mockResolvedValue({ destination_id: 1 });
      Spot.create.mockResolvedValue({});

      const req = mockRequest(
        { name: 'Spot', slug: 'custom-slug' },
        { destination_id: 1 }
      );
      const res = mockResponse();

      await spotController.createSpot(req, res);

      expect(Spot.create).toHaveBeenCalledWith(expect.objectContaining({
        slug: 'custom-slug',
      }));
    });

    it('should return 500 on error', async () => {
      Destination.findByPk.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { destination_id: 1 });
      const res = mockResponse();

      await spotController.createSpot(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL SPOTS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllSpots', () => {
    it('should return all spots with destination', async () => {
      const spots = [{ spot_id: 1 }];
      Spot.findAll.mockResolvedValue(spots);

      const req = mockRequest();
      const res = mockResponse();

      await spotController.getAllSpots(req, res);

      expect(Spot.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, spots });
    });

    it('should return 500 on error', async () => {
      Spot.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await spotController.getAllSpots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SPOTS BY DESTINATION
  // ─────────────────────────────────────────────────────────────────────────
  describe('getSpotsByDestination', () => {
    it('should return spots for a destination', async () => {
      Destination.findByPk.mockResolvedValue({ destination_id: 1 });
      const spots = [{ spot_id: 1 }];
      Spot.findAll.mockResolvedValue(spots);

      const req = mockRequest({}, { destination_id: 1 });
      const res = mockResponse();

      await spotController.getSpotsByDestination(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, spots });
    });

    it('should return 404 if destination not found', async () => {
      Destination.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { destination_id: 999 });
      const res = mockResponse();

      await spotController.getSpotsByDestination(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SPOT BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getSpotById', () => {
    it('should return spot by id', async () => {
      const spot = { spot_id: 1 };
      Spot.findByPk.mockResolvedValue(spot);

      const req = mockRequest({}, { spot_id: 1 });
      const res = mockResponse();

      await spotController.getSpotById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, spot });
    });

    it('should return 404 if not found', async () => {
      Spot.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { spot_id: 999 });
      const res = mockResponse();

      await spotController.getSpotById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SPOT BY NAME
  // ─────────────────────────────────────────────────────────────────────────
  describe('getSpotByName', () => {
    it('should return spot by name slug', async () => {
      const spot = { spot_id: 1, slug: 'laboni-beach' };
      Spot.findOne.mockResolvedValue(spot);

      const req = mockRequest({}, { name: 'Laboni Beach' });
      const res = mockResponse();

      await spotController.getSpotByName(req, res);

      expect(Spot.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { slug: 'laboni-beach' },
      }));
      expect(res.json).toHaveBeenCalledWith({ success: true, spot });
    });

    it('should return 404 if not found', async () => {
      Spot.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { name: 'Unknown Spot' });
      const res = mockResponse();

      await spotController.getSpotByName(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE SPOT
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateSpot', () => {
    it('should update spot successfully', async () => {
      Spot.update.mockResolvedValue([1]);

      const req = mockRequest({ description: 'Updated' }, { spot_id: 1 });
      const res = mockResponse();

      await spotController.updateSpot(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Spot updated successfully' });
    });

    it('should auto-generate slug when name is updated', async () => {
      Spot.update.mockResolvedValue([1]);

      const req = mockRequest({ name: 'New Name' }, { spot_id: 1 });
      const res = mockResponse();

      await spotController.updateSpot(req, res);

      expect(Spot.update).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'new-name' }),
        expect.any(Object)
      );
    });

    it('should return 404 if not found', async () => {
      Spot.update.mockResolvedValue([0]);

      const req = mockRequest({}, { spot_id: 999 });
      const res = mockResponse();

      await spotController.updateSpot(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE SPOT
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteSpot', () => {
    it('should delete spot successfully', async () => {
      Spot.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { spot_id: 1 });
      const res = mockResponse();

      await spotController.deleteSpot(req, res);

      expect(Spot.destroy).toHaveBeenCalledWith({ where: { spot_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Spot deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      Spot.destroy.mockResolvedValue(0);

      const req = mockRequest({}, { spot_id: 999 });
      const res = mockResponse();

      await spotController.deleteSpot(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

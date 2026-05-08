/**
 * Unit Tests for Guide Controller
 * ==================================
 * Tests: getGuides, getGuideById, addGuide, updateGuide, deleteGuide
 */

const guideController = require('../controllers/guide.controller');
const { Guide } = require('../models');

jest.mock('../models', () => ({
  Guide: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Guide Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL GUIDES
  // ─────────────────────────────────────────────────────────────────────────
  describe('getGuides', () => {
    it('should return all guides', async () => {
      const guides = [{ guide_id: 1, name: 'Guide 1' }, { guide_id: 2, name: 'Guide 2' }];
      Guide.findAll.mockResolvedValue(guides);

      const req = mockRequest();
      const res = mockResponse();

      await guideController.getGuides(req, res);

      expect(Guide.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(guides);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET GUIDE BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getGuideById', () => {
    it('should return guide by id', async () => {
      const guide = { guide_id: 1, name: 'Guide' };
      Guide.findByPk.mockResolvedValue(guide);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await guideController.getGuideById(req, res);

      expect(Guide.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(guide);
    });

    it('should return null if guide not found', async () => {
      Guide.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await guideController.getGuideById(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ADD GUIDE
  // ─────────────────────────────────────────────────────────────────────────
  describe('addGuide', () => {
    it('should create guide and return it', async () => {
      const guide = { guide_id: 1, name: 'New Guide' };
      Guide.create.mockResolvedValue(guide);

      const req = mockRequest({ name: 'New Guide', phone: '01700000000' });
      const res = mockResponse();

      await guideController.addGuide(req, res);

      expect(Guide.create).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(guide);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE GUIDE
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateGuide', () => {
    it('should update guide and return result', async () => {
      Guide.update.mockResolvedValue([1]);

      const req = mockRequest({ name: 'Updated Guide' }, { id: 1 });
      const res = mockResponse();

      await guideController.updateGuide(req, res);

      expect(Guide.update).toHaveBeenCalledWith({ name: 'Updated Guide' }, { where: { guide_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Guide updated', updated: [1] });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE GUIDE
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteGuide', () => {
    it('should delete guide and return message', async () => {
      Guide.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await guideController.deleteGuide(req, res);

      expect(Guide.destroy).toHaveBeenCalledWith({ where: { guide_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Guide deleted' });
    });
  });
});

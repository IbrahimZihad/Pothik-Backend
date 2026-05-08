/**
 * Unit Tests for Package Controller
 * ====================================
 * Tests: createPackage, getAllPackages, getPackageById, getPackageByName,
 *        getPackageBySlug, getPackagesByMonth, getPackagesByDate,
 *        updatePackage, deletePackage
 */

const packageController = require('../controllers/package.controller');
const { Package, sequelize } = require('../models');

jest.mock('../models', () => {
  const mockSequelize = {
    fn: jest.fn(),
    col: jest.fn(),
    where: jest.fn(),
  };
  return {
    Package: {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    },
    sequelize: mockSequelize,
    Op: {
      like: Symbol('like'),
      and: Symbol('and'),
    },
  };
});

const mockRequest = (body = {}, params = {}, query = {}) => ({ body, params, query });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

describe('Package Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('createPackage', () => {
    it('should create package and return 201', async () => {
      const pkg = { package_id: 1, name: 'Tour Package' };
      Package.create.mockResolvedValue(pkg);

      const req = mockRequest({
        name: 'Tour Package',
        slug: 'tour-package',
        description: 'A great tour',
        duration_days: 5,
        base_price: 15000,
      });
      const res = mockResponse();

      await packageController.createPackage(req, res);

      expect(Package.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: pkg,
      }));
    });

    it('should return 500 on error', async () => {
      Package.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({});
      const res = mockResponse();

      await packageController.createPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL PACKAGES
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllPackages', () => {
    it('should return all packages', async () => {
      const packages = [{ package_id: 1 }, { package_id: 2 }];
      Package.findAll.mockResolvedValue(packages);

      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      await packageController.getAllPackages(req, res);

      expect(res.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: packages,
      });
    });

    it('should filter by slug', async () => {
      Package.findAll.mockResolvedValue([]);

      const req = mockRequest({}, {}, { slug: 'cox-bazar-tour' });
      const res = mockResponse();

      await packageController.getAllPackages(req, res);

      expect(Package.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ slug: 'cox-bazar-tour' }),
      }));
    });

    it('should return 500 on error', async () => {
      Package.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      await packageController.getAllPackages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGE BY ID
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackageById', () => {
    it('should return package by id', async () => {
      const pkg = { package_id: 1 };
      Package.findByPk.mockResolvedValue(pkg);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await packageController.getPackageById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: pkg });
    });

    it('should return 404 if not found', async () => {
      Package.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await packageController.getPackageById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGE BY NAME
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackageByName', () => {
    it('should return package by name', async () => {
      const pkg = { package_id: 1, name: 'Cox Bazar' };
      Package.findOne.mockResolvedValue(pkg);

      const req = mockRequest({}, { name: 'Cox Bazar' });
      const res = mockResponse();

      await packageController.getPackageByName(req, res);

      expect(Package.findOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: pkg });
    });

    it('should return 404 if not found', async () => {
      Package.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { name: 'Unknown' });
      const res = mockResponse();

      await packageController.getPackageByName(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGE BY SLUG
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackageBySlug', () => {
    it('should return package by slug', async () => {
      const pkg = { package_id: 1, slug: 'cox-bazar' };
      Package.findOne.mockResolvedValue(pkg);

      const req = mockRequest({}, { slug: 'cox-bazar' });
      const res = mockResponse();

      await packageController.getPackageBySlug(req, res);

      expect(Package.findOne).toHaveBeenCalledWith({ where: { slug: 'cox-bazar' } });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: pkg });
    });

    it('should return 404 if not found', async () => {
      Package.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { slug: 'nonexistent' });
      const res = mockResponse();

      await packageController.getPackageBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGES BY MONTH
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackagesByMonth', () => {
    it('should return 400 if month is missing', async () => {
      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      await packageController.getPackagesByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return packages by month', async () => {
      Package.findAll.mockResolvedValue([{ package_id: 1 }]);

      const req = mockRequest({}, {}, { month: '6' });
      const res = mockResponse();

      await packageController.getPackagesByMonth(req, res);

      expect(Package.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 500 on error', async () => {
      Package.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, {}, { month: '6' });
      const res = mockResponse();

      await packageController.getPackagesByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGES BY DATE
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackagesByDate', () => {
    it('should return 400 if date is missing', async () => {
      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      await packageController.getPackagesByDate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return packages by date', async () => {
      Package.findAll.mockResolvedValue([]);

      const req = mockRequest({}, {}, { date: '2025-06-15' });
      const res = mockResponse();

      await packageController.getPackagesByDate(req, res);

      expect(Package.findAll).toHaveBeenCalledWith({ where: { Start_Date: '2025-06-15' } });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('updatePackage', () => {
    it('should update package successfully', async () => {
      const pkg = { package_id: 1, update: jest.fn().mockResolvedValue(true) };
      Package.findByPk.mockResolvedValue(pkg);

      const req = mockRequest({ name: 'Updated' }, { id: 1 });
      const res = mockResponse();

      await packageController.updatePackage(req, res);

      expect(pkg.update).toHaveBeenCalledWith({ name: 'Updated' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if not found', async () => {
      Package.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await packageController.updatePackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('deletePackage', () => {
    it('should delete package successfully', async () => {
      const pkg = { package_id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Package.findByPk.mockResolvedValue(pkg);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await packageController.deletePackage(req, res);

      expect(pkg.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Package deleted successfully' });
    });

    it('should return 404 if not found', async () => {
      Package.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await packageController.deletePackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

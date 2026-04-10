/**
 * Unit Tests for Service (PackageService) Controller
 * =====================================================
 * Tests: addServiceToPackage, removeServiceFromPackage,
 *        getPackageServices, getPackagesByService,
 *        bulkAddServicesToPackage, updatePackageService,
 *        getPackageServiceStats
 */

const serviceController = require('../controllers/service.controller');
const {
  PackageServices,
  Package,
  Hotel,
  HotelRoom,
  Transport,
  Guide,
  User,
  sequelize,
  Op,
} = require('../models');

jest.mock('../models', () => {
  const mockSequelize = {
    fn: jest.fn().mockReturnValue('fn_result'),
    col: jest.fn().mockReturnValue('col_result'),
  };
  return {
    PackageServices: {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    },
    Package: {
      findByPk: jest.fn(),
    },
    Hotel: {
      findByPk: jest.fn(),
    },
    HotelRoom: { name: 'HotelRoom' },
    Transport: {
      findByPk: jest.fn(),
    },
    Guide: {
      findByPk: jest.fn(),
    },
    User: { name: 'User' },
    sequelize: mockSequelize,
    Op: {
      ne: Symbol('ne'),
    },
  };
});

const mockRequest = (body = {}, params = {}, query = {}) => ({ body, params, query });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Service (PackageService) Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ADD SERVICE TO PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('addServiceToPackage', () => {
    it('should add service and return 201', async () => {
      Package.findByPk.mockResolvedValue({ package_id: 1 });
      Hotel.findByPk.mockResolvedValue({ hotel_id: 2 });
      PackageServices.findOne.mockResolvedValue(null);
      PackageServices.create.mockResolvedValue({ id: 1 });

      const req = mockRequest({ package_id: 1, service_type: 'hotel', service_id: 2 });
      const res = mockResponse();

      await serviceController.addServiceToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 400 for invalid service type', async () => {
      const req = mockRequest({ package_id: 1, service_type: 'invalid', service_id: 2 });
      const res = mockResponse();

      await serviceController.addServiceToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if package not found', async () => {
      Package.findByPk.mockResolvedValue(null);

      const req = mockRequest({ package_id: 999, service_type: 'hotel', service_id: 1 });
      const res = mockResponse();

      await serviceController.addServiceToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 if service not found', async () => {
      Package.findByPk.mockResolvedValue({ package_id: 1 });
      Hotel.findByPk.mockResolvedValue(null);

      const req = mockRequest({ package_id: 1, service_type: 'hotel', service_id: 999 });
      const res = mockResponse();

      await serviceController.addServiceToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 409 if service already added', async () => {
      Package.findByPk.mockResolvedValue({ package_id: 1 });
      Hotel.findByPk.mockResolvedValue({ hotel_id: 2 });
      PackageServices.findOne.mockResolvedValue({ id: 1 });

      const req = mockRequest({ package_id: 1, service_type: 'hotel', service_id: 2 });
      const res = mockResponse();

      await serviceController.addServiceToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REMOVE SERVICE FROM PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('removeServiceFromPackage', () => {
    it('should remove service and return 200', async () => {
      const ps = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      PackageServices.findByPk.mockResolvedValue(ps);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await serviceController.removeServiceFromPackage(req, res);

      expect(ps.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if not found', async () => {
      PackageServices.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await serviceController.removeServiceFromPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGE SERVICES
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackageServices', () => {
    it('should return services for a package', async () => {
      Package.findByPk.mockResolvedValue({ package_id: 1 });
      PackageServices.findAll.mockResolvedValue([
        { service_type: 'hotel', HotelService: { name: 'Hotel A' }, toJSON: () => ({}) },
      ]);

      const req = mockRequest({}, { package_id: 1 }, {});
      const res = mockResponse();

      await serviceController.getPackageServices(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if package not found', async () => {
      Package.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { package_id: 999 }, {});
      const res = mockResponse();

      await serviceController.getPackageServices(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGES BY SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackagesByService', () => {
    it('should return packages for a given service', async () => {
      Hotel.findByPk.mockResolvedValue({ hotel_id: 1 });
      PackageServices.findAll.mockResolvedValue([{ id: 1 }]);

      const req = mockRequest({}, { service_type: 'hotel', service_id: 1 });
      const res = mockResponse();

      await serviceController.getPackagesByService(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid service type', async () => {
      const req = mockRequest({}, { service_type: 'invalid', service_id: 1 });
      const res = mockResponse();

      await serviceController.getPackagesByService(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if service not found', async () => {
      Hotel.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { service_type: 'hotel', service_id: 999 });
      const res = mockResponse();

      await serviceController.getPackagesByService(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // BULK ADD SERVICES
  // ─────────────────────────────────────────────────────────────────────────
  describe('bulkAddServicesToPackage', () => {
    it('should return 400 if services is not an array', async () => {
      const req = mockRequest({ package_id: 1, services: 'not-array' });
      const res = mockResponse();

      await serviceController.bulkAddServicesToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if services is empty', async () => {
      const req = mockRequest({ package_id: 1, services: [] });
      const res = mockResponse();

      await serviceController.bulkAddServicesToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if package not found', async () => {
      Package.findByPk.mockResolvedValue(null);

      const req = mockRequest({
        package_id: 999,
        services: [{ service_type: 'hotel', service_id: 1 }],
      });
      const res = mockResponse();

      await serviceController.bulkAddServicesToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should add valid services and collect errors', async () => {
      Package.findByPk.mockResolvedValue({ package_id: 1 });
      Hotel.findByPk.mockResolvedValue({ hotel_id: 1 });
      PackageServices.findOne.mockResolvedValue(null);
      PackageServices.create.mockResolvedValue({ id: 1 });

      const req = mockRequest({
        package_id: 1,
        services: [
          { service_type: 'hotel', service_id: 1 },
          { service_type: 'invalid', service_id: 2 },
        ],
      });
      const res = mockResponse();

      await serviceController.bulkAddServicesToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        added_count: 1,
        error_count: 1,
      }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PACKAGE SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  describe('updatePackageService', () => {
    it('should update package service', async () => {
      const ps = { id: 1, package_id: 1, update: jest.fn().mockResolvedValue(true) };
      PackageServices.findByPk.mockResolvedValue(ps);
      Hotel.findByPk.mockResolvedValue({ hotel_id: 3 });
      PackageServices.findOne.mockResolvedValue(null);

      const req = mockRequest({ service_type: 'hotel', service_id: 3 }, { id: 1 });
      const res = mockResponse();

      await serviceController.updatePackageService(req, res);

      expect(ps.update).toHaveBeenCalledWith({ service_type: 'hotel', service_id: 3 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if package service not found', async () => {
      PackageServices.findByPk.mockResolvedValue(null);

      const req = mockRequest({ service_type: 'hotel', service_id: 1 }, { id: 999 });
      const res = mockResponse();

      await serviceController.updatePackageService(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGE SERVICE STATS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackageServiceStats', () => {
    it('should return stats for a package', async () => {
      Package.findByPk.mockResolvedValue({ package_id: 1 });
      PackageServices.findAll.mockResolvedValue([
        { service_type: 'hotel', count: '2' },
        { service_type: 'guide', count: '1' },
      ]);

      const req = mockRequest({}, { package_id: 1 });
      const res = mockResponse();

      await serviceController.getPackageServiceStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          package_id: 1,
          hotel_count: 2,
          guide_count: 1,
        }),
      }));
    });

    it('should return 404 if package not found', async () => {
      Package.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { package_id: 999 });
      const res = mockResponse();

      await serviceController.getPackageServiceStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

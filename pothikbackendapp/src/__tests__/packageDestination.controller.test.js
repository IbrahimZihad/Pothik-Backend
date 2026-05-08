/**
 * Unit Tests for PackageDestination Controller
 * ================================================
 * Tests: addDestinationToPackage, removeDestinationFromPackage,
 *        getDestinationsByPackage, getPackagesByDestination
 */

const pdController = require('../controllers/packageDestination.controller');
const { PackageDestination, Package, Destination } = require('../models');

jest.mock('../models', () => ({
  PackageDestination: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  Package: { name: 'Package' },
  Destination: { name: 'Destination' },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('PackageDestination Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ADD DESTINATION TO PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('addDestinationToPackage', () => {
    it('should add destination and return 201', async () => {
      PackageDestination.findOne.mockResolvedValue(null);
      const entry = { id: 1, package_id: 1, destination_id: 2 };
      PackageDestination.create.mockResolvedValue(entry);

      const req = mockRequest({ package_id: 1, destination_id: 2 });
      const res = mockResponse();

      await pdController.addDestinationToPackage(req, res);

      expect(PackageDestination.create).toHaveBeenCalledWith({ package_id: 1, destination_id: 2 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Destination added to package successfully',
      }));
    });

    it('should return 400 if required fields missing', async () => {
      const req = mockRequest({ package_id: 1 }); // missing destination_id
      const res = mockResponse();

      await pdController.addDestinationToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if already linked', async () => {
      PackageDestination.findOne.mockResolvedValue({ id: 1 });

      const req = mockRequest({ package_id: 1, destination_id: 2 });
      const res = mockResponse();

      await pdController.addDestinationToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Destination already linked to this package' });
    });

    it('should return 500 on error', async () => {
      PackageDestination.findOne.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({ package_id: 1, destination_id: 2 });
      const res = mockResponse();

      await pdController.addDestinationToPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REMOVE DESTINATION FROM PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('removeDestinationFromPackage', () => {
    it('should remove destination successfully', async () => {
      PackageDestination.destroy.mockResolvedValue(1);

      const req = mockRequest({ package_id: 1, destination_id: 2 });
      const res = mockResponse();

      await pdController.removeDestinationFromPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Destination removed from package successfully' });
    });

    it('should return 400 if required fields missing', async () => {
      const req = mockRequest({ package_id: 1 });
      const res = mockResponse();

      await pdController.removeDestinationFromPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if relation not found', async () => {
      PackageDestination.destroy.mockResolvedValue(0);

      const req = mockRequest({ package_id: 1, destination_id: 999 });
      const res = mockResponse();

      await pdController.removeDestinationFromPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET DESTINATIONS BY PACKAGE
  // ─────────────────────────────────────────────────────────────────────────
  describe('getDestinationsByPackage', () => {
    it('should return destinations for a package', async () => {
      const data = [{ id: 1, destination_id: 2 }];
      PackageDestination.findAll.mockResolvedValue(data);

      const req = mockRequest({}, { package_id: 1 });
      const res = mockResponse();

      await pdController.getDestinationsByPackage(req, res);

      expect(PackageDestination.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { package_id: 1 },
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Destinations fetched',
        count: 1,
      }));
    });

    it('should return 500 on error', async () => {
      PackageDestination.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { package_id: 1 });
      const res = mockResponse();

      await pdController.getDestinationsByPackage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PACKAGES BY DESTINATION
  // ─────────────────────────────────────────────────────────────────────────
  describe('getPackagesByDestination', () => {
    it('should return packages for a destination', async () => {
      const data = [{ id: 1, package_id: 1 }];
      PackageDestination.findAll.mockResolvedValue(data);

      const req = mockRequest({}, { destination_id: 2 });
      const res = mockResponse();

      await pdController.getPackagesByDestination(req, res);

      expect(PackageDestination.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { destination_id: 2 },
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Packages fetched',
        count: 1,
      }));
    });

    it('should return 500 on error', async () => {
      PackageDestination.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { destination_id: 1 });
      const res = mockResponse();

      await pdController.getPackagesByDestination(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

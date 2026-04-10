/**
 * Unit Tests for CustomSession Controller
 * ==========================================
 * Tests: createSession, addService, getSessionDetails,
 *        updateSession, deleteSession, removeService, getAllSessions
 */

const customSessionController = require('../controllers/customSession.controller');
const { CustomSession, CustomSelectedService, User } = require('../models');

jest.mock('../models', () => ({
  CustomSession: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  CustomSelectedService: {
    create: jest.fn(),
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

describe('CustomSession Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE SESSION
  // ─────────────────────────────────────────────────────────────────────────
  describe('createSession', () => {
    it('should create session and return 201', async () => {
      const session = { session_id: 1, user_id: 5 };
      CustomSession.create.mockResolvedValue(session);

      const req = mockRequest({ user_id: 5, travel_from: 'Dhaka', travel_to: 'Cox Bazar', travelers: 3 });
      const res = mockResponse();

      await customSessionController.createSession(req, res);

      expect(CustomSession.create).toHaveBeenCalledWith({
        user_id: 5,
        travel_from: 'Dhaka',
        travel_to: 'Cox Bazar',
        travelers: 3,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ session }));
    });

    it('should return 500 on error', async () => {
      CustomSession.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({});
      const res = mockResponse();

      await customSessionController.createSession(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ADD SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  describe('addService', () => {
    it('should add service to session and return 201', async () => {
      const service = { id: 1, session_id: 1, service_type: 'hotel', service_id: 2 };
      CustomSelectedService.create.mockResolvedValue(service);

      const req = mockRequest({ session_id: 1, service_type: 'hotel', service_id: 2, quantity: 1 });
      const res = mockResponse();

      await customSessionController.addService(req, res);

      expect(CustomSelectedService.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 500 on error', async () => {
      CustomSelectedService.create.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({});
      const res = mockResponse();

      await customSessionController.addService(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SESSION DETAILS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getSessionDetails', () => {
    it('should return session with services', async () => {
      const session = { session_id: 1, services: [] };
      CustomSession.findOne.mockResolvedValue(session);

      const req = mockRequest({}, { session_id: 1 });
      const res = mockResponse();

      await customSessionController.getSessionDetails(req, res);

      expect(CustomSession.findOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(session);
    });

    it('should return 404 if session not found', async () => {
      CustomSession.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { session_id: 999 });
      const res = mockResponse();

      await customSessionController.getSessionDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Session not found' });
    });

    it('should return 500 on error', async () => {
      CustomSession.findOne.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { session_id: 1 });
      const res = mockResponse();

      await customSessionController.getSessionDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE SESSION
  // ─────────────────────────────────────────────────────────────────────────
  describe('updateSession', () => {
    it('should update session successfully', async () => {
      const session = { session_id: 1, update: jest.fn().mockResolvedValue(true) };
      CustomSession.findByPk.mockResolvedValue(session);

      const req = mockRequest({ travelers: 5 }, { session_id: 1 });
      const res = mockResponse();

      await customSessionController.updateSession(req, res);

      expect(session.update).toHaveBeenCalledWith({ travelers: 5 });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Session updated successfully' }));
    });

    it('should return 404 if session not found', async () => {
      CustomSession.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { session_id: 999 });
      const res = mockResponse();

      await customSessionController.updateSession(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE SESSION
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteSession', () => {
    it('should delete session and its services', async () => {
      CustomSelectedService.destroy.mockResolvedValue(2);
      CustomSession.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { session_id: 1 });
      const res = mockResponse();

      await customSessionController.deleteSession(req, res);

      expect(CustomSelectedService.destroy).toHaveBeenCalledWith({ where: { session_id: 1 } });
      expect(CustomSession.destroy).toHaveBeenCalledWith({ where: { session_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Session and related services deleted' });
    });

    it('should return 500 on error', async () => {
      CustomSelectedService.destroy.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, { session_id: 1 });
      const res = mockResponse();

      await customSessionController.deleteSession(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REMOVE SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  describe('removeService', () => {
    it('should remove service successfully', async () => {
      CustomSelectedService.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { id: 5 });
      const res = mockResponse();

      await customSessionController.removeService(req, res);

      expect(CustomSelectedService.destroy).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Service removed successfully' });
    });

    it('should return 404 if service not found', async () => {
      CustomSelectedService.destroy.mockResolvedValue(0);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await customSessionController.removeService(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL SESSIONS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getAllSessions', () => {
    it('should return all sessions', async () => {
      const sessions = [{ session_id: 1 }];
      CustomSession.findAll.mockResolvedValue(sessions);

      const req = mockRequest();
      const res = mockResponse();

      await customSessionController.getAllSessions(req, res);

      expect(CustomSession.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(sessions);
    });

    it('should return 500 on error', async () => {
      CustomSession.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();

      await customSessionController.getAllSessions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

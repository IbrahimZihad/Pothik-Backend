const request = require('supertest');
const express = require('express');

// Mock middleware
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = { id: 'user-123' };
    next();
  }),
}));

// Mock controller
jest.mock('../controllers/notification.controller', () => ({
  getUserNotifications: jest.fn((req, res) =>
    res.status(200).json({ notifications: [] })
  ),
  getUnreadCount: jest.fn((req, res) =>
    res.status(200).json({ count: 5 })
  ),
  markAllAsRead: jest.fn((req, res) =>
    res.status(200).json({ message: 'All notifications marked as read' })
  ),
  markAsRead: jest.fn((req, res) =>
    res.status(200).json({ message: 'Notification marked as read' })
  ),
  deleteNotification: jest.fn((req, res) =>
    res.status(200).json({ message: 'Notification deleted' })
  ),
}));

const routes = require('../routes/notification.routes');
const controller = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.use('/notifications', routes);

describe('Notification Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Get All Notifications ───────────────────────────────────
  describe('GET /notifications', () => {
    it('should return all user notifications', async () => {
      const res = await request(app).get('/notifications');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notifications');
      expect(authMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if unauthorized', async () => {
      authMiddleware.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: 'Unauthorized' })
      );

      const res = await request(app).get('/notifications');
      expect(res.statusCode).toBe(401);
      expect(controller.getUserNotifications).not.toHaveBeenCalled();
    });
  });

  // ─── Get Unread Count ────────────────────────────────────────
  describe('GET /notifications/unread-count', () => {
    it('should return unread notification count', async () => {
      const res = await request(app).get('/notifications/unread-count');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('count');
    });
  });

  // ─── Mark All As Read ────────────────────────────────────────
  describe('PUT /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await request(app).put('/notifications/read-all');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: 'All notifications marked as read',
      });
    });
  });

  // ─── Mark One As Read ────────────────────────────────────────
  describe('PUT /notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const res = await request(app).put('/notifications/notif-1/read');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: 'Notification marked as read',
      });
    });

    it('should return 404 if notification not found', async () => {
      controller.markAsRead.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Notification not found' })
      );

      const res = await request(app).put('/notifications/bad-id/read');
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── Delete Notification ─────────────────────────────────────
  describe('DELETE /notifications/:id', () => {
    it('should delete a notification', async () => {
      const res = await request(app).delete('/notifications/notif-1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Notification deleted' });
    });

    it('should return 404 if notification not found', async () => {
      controller.deleteNotification.mockImplementationOnce((req, res) =>
        res.status(404).json({ error: 'Notification not found' })
      );

      const res = await request(app).delete('/notifications/bad-id');
      expect(res.statusCode).toBe(404);
    });
  });
});
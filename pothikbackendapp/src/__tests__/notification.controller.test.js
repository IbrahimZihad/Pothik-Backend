/**
 * Unit Tests for Notification Controller
 * =========================================
 * Tests: getUserNotifications, getUnreadCount, markAsRead,
 *        markAllAsRead, deleteNotification, createNotification
 */

const notifController = require('../controllers/notification.controller');
const { Notification } = require('../models');

jest.mock('../models', () => ({
  Notification: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
}));

const mockRequest = (body = {}, params = {}, user = {}) => ({ body, params, user });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Notification Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET USER NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getUserNotifications', () => {
    it('should return all notifications for authenticated user', async () => {
      const notifications = [{ notification_id: 1 }, { notification_id: 2 }];
      Notification.findAll.mockResolvedValue(notifications);

      const req = mockRequest({}, {}, { id: 5 });
      const res = mockResponse();

      await notifController.getUserNotifications(req, res);

      expect(Notification.findAll).toHaveBeenCalledWith({
        where: { user_id: 5 },
        order: [['created_at', 'DESC']],
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: notifications });
    });

    it('should return 500 on error', async () => {
      Notification.findAll.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, {}, { id: 5 });
      const res = mockResponse();

      await notifController.getUserNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET UNREAD COUNT
  // ─────────────────────────────────────────────────────────────────────────
  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      Notification.count.mockResolvedValue(3);

      const req = mockRequest({}, {}, { id: 5 });
      const res = mockResponse();

      await notifController.getUnreadCount(req, res);

      expect(Notification.count).toHaveBeenCalledWith({
        where: { user_id: 5, is_read: false },
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { unreadCount: 3 } });
    });

    it('should return 500 on error', async () => {
      Notification.count.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, {}, { id: 5 });
      const res = mockResponse();

      await notifController.getUnreadCount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MARK AS READ
  // ─────────────────────────────────────────────────────────────────────────
  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = { notification_id: 1, update: jest.fn().mockResolvedValue(true) };
      Notification.findOne.mockResolvedValue(notification);

      const req = mockRequest({}, { id: 1 }, { id: 5 });
      const res = mockResponse();

      await notifController.markAsRead(req, res);

      expect(Notification.findOne).toHaveBeenCalledWith({
        where: { notification_id: 1, user_id: 5 },
      });
      expect(notification.update).toHaveBeenCalledWith({ is_read: true });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 404 if notification not found', async () => {
      Notification.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 }, { id: 5 });
      const res = mockResponse();

      await notifController.markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MARK ALL AS READ
  // ─────────────────────────────────────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      Notification.update.mockResolvedValue([5]);

      const req = mockRequest({}, {}, { id: 5 });
      const res = mockResponse();

      await notifController.markAllAsRead(req, res);

      expect(Notification.update).toHaveBeenCalledWith(
        { is_read: true },
        { where: { user_id: 5, is_read: false } }
      );
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'All notifications marked as read' });
    });

    it('should return 500 on error', async () => {
      Notification.update.mockRejectedValue(new Error('DB error'));

      const req = mockRequest({}, {}, { id: 5 });
      const res = mockResponse();

      await notifController.markAllAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE NOTIFICATION
  // ─────────────────────────────────────────────────────────────────────────
  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const notification = { notification_id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Notification.findOne.mockResolvedValue(notification);

      const req = mockRequest({}, { id: 1 }, { id: 5 });
      const res = mockResponse();

      await notifController.deleteNotification(req, res);

      expect(notification.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Notification deleted' });
    });

    it('should return 404 if notification not found', async () => {
      Notification.findOne.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 }, { id: 5 });
      const res = mockResponse();

      await notifController.deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE NOTIFICATION (internal utility)
  // ─────────────────────────────────────────────────────────────────────────
  describe('createNotification', () => {
    it('should create notification and return it', async () => {
      const notification = { notification_id: 1, title: 'Test' };
      Notification.create.mockResolvedValue(notification);

      const result = await notifController.createNotification({
        user_id: 5,
        type: 'booking',
        title: 'Test',
        message: 'Test message',
        link: '/test',
      });

      expect(Notification.create).toHaveBeenCalledWith({
        user_id: 5,
        type: 'booking',
        title: 'Test',
        message: 'Test message',
        link: '/test',
      });
      expect(result).toEqual(notification);
    });

    it('should use default type "system" if not provided', async () => {
      Notification.create.mockResolvedValue({});

      await notifController.createNotification({
        user_id: 5,
        title: 'Test',
        message: 'Msg',
      });

      expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'system',
      }));
    });

    it('should return null on error', async () => {
      Notification.create.mockRejectedValue(new Error('DB error'));

      const result = await notifController.createNotification({
        user_id: 5,
        title: 'Test',
        message: 'Msg',
      });

      expect(result).toBeNull();
    });
  });
});

const { Notification } = require("../models");

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL NOTIFICATIONS FOR THE AUTHENTICATED USER
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]],
        });

        res.json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET UNREAD COUNT
// ─────────────────────────────────────────────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { user_id: req.user.id, is_read: false },
        });

        res.json({ success: true, data: { unreadCount: count } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK ONE NOTIFICATION AS READ
// ─────────────────────────────────────────────────────────────────────────────
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { notification_id: req.params.id, user_id: req.user.id },
        });

        if (!notification) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }

        await notification.update({ is_read: true });

        res.json({ success: true, message: "Notification marked as read", data: notification });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK ALL NOTIFICATIONS AS READ
// ─────────────────────────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.user.id, is_read: false } }
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE A NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { notification_id: req.params.id, user_id: req.user.id },
        });

        if (!notification) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }

        await notification.destroy();

        res.json({ success: true, message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE A NOTIFICATION (utility — used internally by other controllers)
// ─────────────────────────────────────────────────────────────────────────────
exports.createNotification = async ({ user_id, type, title, message, link }) => {
    try {
        const notification = await Notification.create({
            user_id,
            type: type || "system",
            title,
            message,
            link: link || null,
        });
        return notification;
    } catch (err) {
        console.error("Failed to create notification:", err.message);
        return null;
    }
};

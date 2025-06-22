import NotificationModel from "../models/notificationModel.js";

// ✅ Get Admin Notifications
export const getNotificationsForAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        const notifications = await NotificationModel.find({
            to: adminId,
            toModel: "Admin",
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Notifications for admin fetched",
            data: notifications,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching admin notifications",
            error: err.message,
        });
    }
};

// ✅ Get User Notifications
export const getNotificationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await NotificationModel.find({
            to: userId,
            toModel: "User",
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Notifications for user fetched",
            data: notifications,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching user notifications",
            error: err.message,
        });
    }
};

// ✅ Mark Notification as Read
export const markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const updated = await NotificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
            error: err.message,
        });
    }
};

// ✅ Delete Notification (auth protected)
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const currentUserId = req.user._id;
        const currentUserRole =
            req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);

        const notification = await NotificationModel.findOne({
            _id: notificationId,
            to: currentUserId,
            toModel: currentUserRole,
        });

        if (!notification) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this notification",
            });
        }

        await NotificationModel.findByIdAndDelete(notificationId);

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete notification",
            error: err.message,
        });
    }
};

export const getNotificationCountForAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;

        const count = await NotificationModel.countDocuments({
            to: adminId,
            toModel: "Admin",
        });

        res.status(200).json({
            success: true,
            message: "Notification count for admin fetched",
            count: count,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error counting admin notifications",
            error: err.message,
        });
    }
};

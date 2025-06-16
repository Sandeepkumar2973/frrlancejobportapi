import NotificationModel from "../models/notificationModel.js";

export const getNotificationsForAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;

        const notifications = await NotificationModel.find({
            to: adminId,
            toModel: "Admin"
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Notifications for admin fetched",
            data: notifications
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching admin notifications",
            error: err.message
        });
    }
};

export const getNotificationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await NotificationModel.find({
            to: userId,
            toModel: "User"
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Notifications for user fetched",
            data: notifications
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching user notifications",
            error: err.message
        });
    }
};

// delete notification by user 


export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const currentUserId = req.user._id;     // From auth middleware
        const currentUserRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)
        // console.log(req.user, 'kmlk')
        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification ID is required"
            });
        }

        // Check if notification belongs to the current user/admin
        const notification = await NotificationModel.findOne({
            _id: notificationId,
            to: currentUserId,
            toModel: currentUserRole
        });

        if (!notification) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this notification"
            });
        }

        await NotificationModel.findByIdAndDelete(notificationId);

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete notification",
            error: err.message
        });
    }
};


import ApplicationModel from "../models/ApplicationModel.js";
import NotificationModel from '../models/notificationModel.js';

export const getApplicationByAdminId = async (req, res) => {
    try {
        const adminId = req.params.adminId;
        const applications = await ApplicationModel.find({ adminId: adminId }).populate('jobId', 'title companyName');

        if (!applications || applications.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No applications found for this admin"
            });
        }

        res.status(200).send({
            success: true,
            message: "Applications retrieved successfully",
            data: applications
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting applications",
            error: error.message
        });
    }
}



// get user by applicationId
export const getUserApplicationById = async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        const application = await ApplicationModel.findById(applicationId).populate('jobId', 'title companyName').populate('userId', 'name email');
        if (!application) {
            return res.status(404).send({
                success: false,
                message: "Application not found"
            });
        }
        res.status(200).send({
            success: true,
            message: "Application retrieved successfully",
            data: application
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting application",
            error: error.message
        });
    }
};


export const changeApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { applicationId } = req.params;

        if (!status || !applicationId) {
            return res.status(400).send({
                success: false,
                message: "Status and applicationId are required"
            });
        }

        // Update application status
        const updatedApplication = await ApplicationModel.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        )
            .populate('jobId', 'title company')  // ensure these fields are correct
            .populate('userId', 'name email');

        if (!updatedApplication) {
            return res.status(404).send({
                success: false,
                message: "Application not found"
            });
        }

        // === Send Notification to User ===
        await NotificationModel.create({
            to: updatedApplication.userId._id,
            toModel: 'User',
            type: 'status_update',
            title: `Job Application ${status}`,
            message: `Your application has been ${status}${updatedApplication.jobId?.title ? ` for "${updatedApplication.jobId.title}"` : ''}${updatedApplication.jobId?.company ? ` at "${updatedApplication.jobId.company}"` : ''}.`,
            isRead: false,
            createdAt: new Date()
        });
        // ==================================

        res.status(200).send({
            success: true,
            message: "Application status updated and user notified",
            data: updatedApplication
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in updating application status",
            error: error.message
        });
    }
};

// get notification by admin
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
// controllers/applicationController.js




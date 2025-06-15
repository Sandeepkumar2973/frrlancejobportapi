import ApplicationModel from "../models/ApplicationModel.js";

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

// change application status by adminId
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
        const updatedApplication = await ApplicationModel.findByIdAndUpdate(
            applicationId,
            { status: status },
            { new: true }
        ).populate('jobId', 'title companyName').populate('userId', 'name email');

        if (!updatedApplication) {
            return res.status(404).send({
                success: false,
                message: "Application not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Application status updated successfully",
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

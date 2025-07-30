import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import AdminModel from '../models/adminModel.js';
import superAdminModel from "../models/superadminModel.js";
import JobModel from '../models/jobModel.js';
import UserModel from '../models/userModel.js';
import ApplicationModel from '../models/ApplicationModel.js';

export const createSuperAdmin = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existingAdmin = await superAdminModel.find({ email: email });
        if (existingAdmin.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Super admin already exists with this email"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newSuperAdmin = new superAdminModel({
            fullName: fullName,
            email: email,
            password: hashedPassword
        });
        await newSuperAdmin.save();
        res.status(201).send({
            success: true,
            message: "Super admin created successfully",
            data: newSuperAdmin
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in creating super admin",
            error: error.message
        });
    }
}


export const loginSuperAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Use findOne instead of find
        const superAdminData = await superAdminModel.findOne({ email });

        // Check if super admin exists
        if (!superAdminData) {
            return res.status(404).send({
                success: false,
                message: "Super admin not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, superAdminData.password);

        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: 'Super admin credentials do not match'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: superAdminData._id, role: superAdminData.role },
            process.env.SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.status(200).send({
            success: true,
            message: "Super admin logged in successfully",
            data: {
                token,
                superAdmin: {
                    id: superAdminData._id,
                    email: superAdminData.email,
                    role: superAdminData.role
                    // Add more fields if needed
                }
            }
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in logging in super admin",
            error: error.message
        });
    }
};

// Function to get all admin counts
export const getAllAdminsCounts = async (req, res) => {
    try {
        const adminCounts = await AdminModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalAdmins: { $sum: 1 },
                    totalActiveAdmins: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                    totalInactiveAdmins: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } }
                }
            }
        ]);
        if (adminCounts.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No admins found"
            });
        }
        res.status(200).send(
            {
                success: true,
                message: "Admin counts retrieved successfully",
                data: adminCounts[0]
            });

    } catch (error) {
        res.status(500)
            .send({
                success: false,
                message: "error in getting admin counts",
                error: error.message
            })
    }
}

// get all jobs counts
export const getAllJobsCounts = async (req, res) => {
    try {
        const jobCounts = await JobModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    totalActiveJobs: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
                    totalInactiveJobs: { $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] } }
                }
            }
        ]);
        if (jobCounts.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No jobs found"
            });
        }
        res.status(200).send({
            success: true,
            message: "Job counts retrieved successfully",
            data: jobCounts[0]
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting job counts",
            error: error.message
        });
    }
}

// het all users counts 
export const getAllUsersCounts = async (req, res) => {
    try {
        const userCounts = await UserModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalverifyUsers: { $sum: { $cond: [{ $eq: ["$isVerified", "true"] }, 1, 0] } },
                    totalUnverifyUsers: { $sum: { $cond: [{ $eq: ["$isVerified", "false"] }, 1, 0] } }
                }
            }
        ]);
        if (userCounts.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No users found"
            });
        }
        res.status(200).send({
            success: true,
            message: "User counts retrieved successfully",
            data: userCounts[0]
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting user counts",
            error: error.message
        });
    }
}

// get all applicants counts

export const getAllApplicantsCounts = async (req, res) => {
    try {
        const applicantsCounts = await ApplicationModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalApplicants: { $sum: 1 },
                    totalViewApplicants: { $sum: { $cond: [{ $eq: ["$status", "Viewed"] }, 1, 0] } },
                    totalRejectedApplicants: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
                    totalShortlistedApplicants: { $sum: { $cond: [{ $eq: ["$status", "Shortlisted"] }, 1, 0] } },
                    totalAppliedApplicants: { $sum: { $cond: [{ $eq: ["$status", "Applied"] }, 1, 0] } }
                }
            }
        ]);
        if (applicantsCounts.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No applicants found"
            });
        }
        res.status(200).send({
            success: true,
            message: "Applicants counts retrieved successfully",
            data: applicantsCounts[0]
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting applicants counts",
            error: error.message
        });
    }
}
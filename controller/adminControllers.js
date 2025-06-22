import express from 'express';
import AdminModel from '../models/adminModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { sendMobileOtp, sendOtpEmail } from './userControllers.js';
import TempUserModel from '../models/TempUserModel.js';
import Admin from '../models/adminModel.js';
import ResetOtpModel from '../models/ResetOtpModel.js';
import ApplicationModel from '../models/ApplicationModel.js';
import moment from "moment"; // optional, for date formatting

export const createAmin = async (req, res) => {
    // console.log(req.body, 'jijojo');
    try {
        const { fullName, email, companyName, password } = req.body;
        const existingAdmin = await AdminModel.findOne({
            email: email
        })
        if (existingAdmin) {
            return res.status(200)
                .send({
                    success: false,
                    message: "admin already exists with this email"
                })
        };
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is salt rounds

        // Create new admin
        const newAdmin = new AdminModel({
            fullName,
            email,
            companyName,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).send({
            success: true,
            message: " created successfully",
            data: newAdmin
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in creating admin",
            error: error.message
        });
    }
}

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminData = await AdminModel.findOne({ email });
        if (!adminData) {
            return res.status(404).send({
                success: false,
                message: "Admin not found"
            });
        }
        console.log(adminData, 'admin data');


        // Compare passwords
        const isMatch = await bcrypt.compare(password, adminData.password);
        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT token
        const token = jwt.sign({ _id: adminData._id, role: adminData.role, name: adminData.fullName }, process.env.SECRET_KEY, {
            expiresIn: "7d"
        });

        // Return success response
        return res.status(200).send({
            success: true,
            message: "Login successful",
            data: {
                token,
                admin: {
                    id: adminData._id,
                    name: adminData.name,
                    email: adminData.email
                }
            }
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default page = 1
        const limit = parseInt(req.query.limit) || 10; // Default limit = 10

        const skip = (page - 1) * limit;

        // Total count (without password)
        const total = await AdminModel.countDocuments();

        // Fetch paginated admins
        const admins = await AdminModel.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).send({
            success: true,
            message: "Admins fetched successfully",
            data: admins,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting admins",
            error: error.message,
        });
    }
};

export const getAdminByID = async (req, res) => {

    try {
        const admin = await AdminModel.findById(req.params.id).select("-password");
        if (!admin) {
            return res.status(404)
                .send({
                    success: false,
                    message: " admin not found",
                })
        }
        res.status(200)
            .send({
                success: true,
                message: "admin found successfully",
                data: admin
            });
    } catch (error) {
        res.status(500)
            .send({
                success: false,
                message: "error in getting admin",
                error: error.message
            })
    }
}

export const deleteAdmin = async (req, res) => {
    try {
        const admin = await AdminModel.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404)
                .send({
                    success: false,
                    message: "admin not found",
                })
        };
        res.status(200)
            .send({
                success: true,
                message: " admin deleted successfully",
                data: admin
            })
    } catch (error) {
        res.status(500)
            .send({
                success: false,
                message: " error in deleteing admin",
                error: error.message
            })
    }
}

export const updateAdmin = async (req, res) => {
    const { fullName, email, companyName, status } = req.body;

    try {
        const updatedAdmin = await AdminModel.findByIdAndUpdate(
            req.params.id,
            {
                fullName: fullName,
                email: email,
                companyName: companyName,
                status: status
            },
            { new: true } // This returns the updated document
        );

        if (!updatedAdmin) {
            return res.status(404).send({
                success: false,
                message: "Admin not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Admin updated successfully",
            data: updatedAdmin
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in updating admin",
            error: error.message
        });
    }
};

export const createAdminByOtpVery = async (req, res) => {
    const { fullName, email, companyName, password } = req.body;
    try {
        const existingUser = await AdminModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'This user is already registered',
            });
        }

        const existingTemp = await TempUserModel.findOne({ email });
        if (existingTemp) {
            await TempUserModel.deleteOne({ email });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

        await sendOtpEmail(email, emailOtp);
        await sendMobileOtp(phone, mobileOtp);

        const tempUser = new TempUserModel({
            fullName,
            email,
            phone,
            companyName,
            password: hashedPass,
            emailOtp,
            mobileOtp
        });

        await tempUser.save();

        res.status(200).send({
            success: true,
            message: 'OTP sent to email and mobile. Please verify to complete registration.',
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error sending OTP',
            error: error.message,
        });
    }
};
export const verifyOtp = async (req, res) => {
    const { email, emailOtp, mobileOtp } = req.body;
    console.log(email, emailOtp, mobileOtp, 'email otp');
    try {
        const tempUser = await TempUserModel.findOne({ email });
        if (!tempUser) {
            return res.status(400).send({ success: false, message: 'OTP session expired or not found' });
        }

        if (tempUser.emailOtp !== emailOtp || tempUser.mobileOtp !== mobileOtp) {
            return res.status(400).send({ success: false, message: 'Invalid OTPs' });
        }

        const user = new UserModel({
            email: tempUser.email,
            fullName: tempUser.fullName,
            password: tempUser.password,
            phone: tempUser.phone,
            companyName: tempUser.companyName,
            isVerified: true
        });

        await user.save();
        await TempUserModel.deleteOne({ email });

        res.status(201).send({
            success: true,
            message: 'User created successfully',
            data: user
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
};

export const forgotPassSendOtp = async (req, res) => {
    const { email, phone } = req.body;
    if (!email && !phone) {
        return res.status(400).send({ success: false, message: 'Email or phone is required' });
    }

    try {
        const user = await AdminModel.findOne({ $or: [{ email }, { phone }] });
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Clean up any existing OTPs
        await ResetOtpModel.deleteMany({ $or: [{ email }, { phone }] });

        if (email) {
            await sendOtpEmail(email, otp);
        } else {
            await sendMobileOtp(phone, otp);
        }

        const otpEntry = new ResetOtpModel({ email, phone, otp });
        await otpEntry.save();

        res.status(200).send({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to send OTP', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, phone, otp, newPassword } = req.body;
    console.log(email, phone, otp, newPassword, 'email phone otp new password');
    try {
        const otpEntry = await ResetOtpModel.findOne({ $or: [{ email }, { phone }] });
        if (!otpEntry || otpEntry.otp !== otp) {
            return res.status(400).send({ success: false, message: 'Invalid or expired OTP' });
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);
        await UserModel.findOneAndUpdate(
            { $or: [{ email }, { phone }] },
            { password: hashedPass }
        );

        await ResetOtpModel.deleteOne({ _id: otpEntry._id });

        res.status(200).send({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to reset password', error: error.message });
    }
};

// get user name by applicationId
export const getUserApplicationById = async (req, res) => {
    try {
        const { adminId } = req.params;
        const application = await ApplicationModel.find({ adminId })
            .populate('jobId', 'title companyName')
            .populate('userId', 'fullName email phone resumeUrl');
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
// application count 
export const getApplicationCountByAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        const count = await ApplicationModel.countDocuments({ adminId });

        res.status(200).send({
            success: true,
            message: "Application count retrieved successfully",
            count: count
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in counting applications",
            error: error.message
        });
    }
};

// user count 
export const countUniqueApplicantsByAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;

        // Get all unique userIds who applied to jobs of this admin
        const uniqueUserIds = await ApplicationModel.distinct("userId", { adminId });

        res.status(200).send({
            success: true,
            message: "Unique applicant count retrieved successfully",
            count: uniqueUserIds.length
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting applicant count",
            error: error.message
        });
    }
};

// controllers/applicationController.js


import mongoose from "mongoose";

export const getApplicantsByDate = async (req, res) => {
  const { adminId } = req.params;

  try {
    const result = await ApplicationModel.aggregate([
      {
        $match: {
          adminId: new mongoose.Types.ObjectId(adminId),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = result.map((item) => ({
      date: item._id, // e.g., "2024-06-21"
      count: item.count,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting applicant chart data",
      error: error.message,
    });
  }
};
;


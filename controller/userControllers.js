import UserModel from "./../models/userModel.js";
import TempUserModel from "./../models/TempUserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// otp work
import nodemailer from "nodemailer";
import axios from "axios";
import ResetOtpModel from "../models/ResetOtpModel.js";
import ApplicationModel from "../models/ApplicationModel.js";
import cloudinary from "../config/cloudinary.js";
import notificationModel from "../models/notificationModel.js";
// send otp on email
export const sendOtpEmail = async (email, OTP) => {
  console.log(email, OTP, "email and phone");

  if (!email) {
    console.error("Invalid parameters for sending email");
    return;
  } // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });
  // Email options
  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: "Your One-Time Password (OTP)",
    text: `Your OTP is: ${OTP}. It will expire in 3 minutes. Never share your OTP with anyone.`,
  };
  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true; // Return true if email is sent successfully
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false; // Return false if there is an error sending the email
  }
};

// send otp on mobile
export const sendMobileOtp = async (phone, otp) => {
  const apiKey = "YOUR_MSG91_AUTHKEY";
  const templateId = "YOUR_TEMPLATE_ID"; // from MSG91

  const url = `https://api.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${phone}&authkey=${apiKey}&otp=${otp}`;

  await axios.get(url);
};

export const createUserByOtpVery = async (req, res) => {
  const { email, fullName, password, phone } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "This user is already registered",
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
      password: hashedPass,
      emailOtp,
      mobileOtp,
    });

    await tempUser.save();

    res.status(200).send({
      success: true,
      message:
        "OTP sent to email and mobile. Please verify to complete registration.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};
export const verifyOtp = async (req, res) => {
  const { email, emailOtp, mobileOtp } = req.body;
  console.log(email, emailOtp, mobileOtp, "email otp");
  try {
    const tempUser = await TempUserModel.findOne({ email });
    if (!tempUser) {
      return res
        .status(400)
        .send({ success: false, message: "OTP session expired or not found" });
    }

    if (tempUser.emailOtp !== emailOtp || tempUser.mobileOtp !== mobileOtp) {
      return res.status(400).send({ success: false, message: "Invalid OTPs" });
    }

    const user = new UserModel({
      email: tempUser.email,
      fullName: tempUser.fullName,
      password: tempUser.password,
      phone: tempUser.phone,
      isVerified: true,
    });

    await user.save();
    await TempUserModel.deleteOne({ email });

    res.status(201).send({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

export const forgotPassSendOtp = async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res
      .status(400)
      .send({ success: false, message: "Email or phone is required" });
  }

  try {
    const user = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
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

    res.status(200).send({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      });
  }
};

export const resetPassword = async (req, res) => {
  const { email, phone, otp, newPassword } = req.body;
  console.log(email, phone, otp, newPassword, "email phone otp new password");
  try {
    const otpEntry = await ResetOtpModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (!otpEntry || otpEntry.otp !== otp) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPass = await bcrypt.hash(newPassword, 10);
    await UserModel.findOneAndUpdate(
      { $or: [{ email }, { phone }] },
      { password: hashedPass }
    );

    await ResetOtpModel.deleteOne({ _id: otpEntry._id });

    res
      .status(200)
      .send({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Failed to reset password",
        error: error.message,
      });
  }
};
//
export const createUser = async (req, res) => {
  const { email, fullName, password, phone } = req.body;
  try {
    const file = req.files;
    const hashedPass = await bcrypt.hash(password, 10);
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "this user already registerd",
      });
    }
    const user = new UserModel({
      email,
      fullName,
      password: hashedPass,
      phone,
    });
    await user.save();
    res.status(201).send({
      success: true,
      message: " user created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "user not created",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await UserModel.findOne({ email });
    if (!userData) {
      return res.status(
        (404).send({
          success: false.valueOf,
          message: "user not found",
        })
      );
    }
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "user data not matched",
      });
    }
    const token = jwt.sign(
      { _id: userData._id, role: userData.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).send({
      success: true,
      message: " user login successfully",
      data: { token, userData },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "user not login",
      error: error.message,
    });
  }
};
export const loginWithGoogle = async (req, res) => {
  exports.loginWithGoogle = async (req, res) => {
    function generateRandomPhone() {
      const prefix = "9"; // start with 9 to make it realistic
      const randomDigits = Math.floor(100000000 + Math.random() * 900000000); // 9-digit number
      return prefix + randomDigits.toString();
    }

    try {
      const { name, email, profilePic } = req.body;

      // Check if user already exists
      let existingUser = await UserModel.findOne({ email });

      if (!existingUser) {
        const user = new UserModel({
          name,
          email,
          profilePic,
          password: "", // Google login users don't need password
          phone: generateRandomPhone(), // Prevent `null` from being saved
        });

        const savedUser = await user.save();
      }
      // Generate JWT token
      const token = jwt.sign(
        { userId: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      // Send response
      const savedUser = {
        name: existingUser.name,
        email: existingUser.email,
        id: existingUser._id,
        token: token,
      };
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "User saved successfully",
        data: savedUser,
      });
    } catch (error) {
      console.error("Error in loginWithGoogle:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
export const getallUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page = 1
    const limit = parseInt(req.query.limit) || 10; // Default limit = 10

    const skip = (page - 1) * limit;
    const total = await UserModel.countDocuments();
    const user = await UserModel.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (user.length === 0) {
      return res.status(404).send({
        success: false,
        message: "no users found",
      });
    }
    res.status(200).send({
      success: true,
      message: "all users find successfully",
      data: user,
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
      message: "error in getting all users",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "user found successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting user by id",
      error: error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // List of top-level fields to check and update if present
    const fields = [
      "fullName",
      "email",
      "phone",
      "profilePicture",
      "dob",
      "gender",
      "currentLocation",
      "preferredLocations",
      "resumeUrl",
      "profileCompleted",
      "experience",
    ];

    for (const field of fields) {
      if (
        updates[field] !== undefined &&
        updates[field] !== null &&
        updates[field] !== ""
      ) {
        user[field] = updates[field];
      }
    }

    // Handle nested arrays: Replace only if new data is provided
    if (Array.isArray(updates.education) && updates.education.length > 0) {
      user.education = updates.education;
    }

    if (Array.isArray(updates.experience) && updates.experience.length > 0) {
      user.experience = updates.experience;
    }

    if (Array.isArray(updates.skills) && updates.skills.length > 0) {
      user.skills = updates.skills;
    }

    const updatedUser = await user.save();

    res.status(200).send({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating user profile",
      error: error.message,
    });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "user deleted successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in deleting user",
      error: error.message,
    });
  }
};

// filter user by experience name location and skills
//GET http://localhost:8000/api/v1/user/filter?name=john&skills=react,node&location=delhi&page=2&limit=5

export const filterUser = async (req, res) => {
  try {
    const { experience, name, location, skills } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (experience) {
      filter.experience = experience;
    }
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (skills) {
      filter.skills = { $in: skills.split(",") };
    }

    const total = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Filtered users retrieved successfully",
      data: users,
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
      message: "Error in filtering users",
      error: error.message,
    });
  }
};

// add skills to user
export const addSkill = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(req.params, "user id");
    let { skill, proficiency } = req.body;

    // Capitalize proficiency input safely
    proficiency =
      proficiency.charAt(0).toUpperCase() + proficiency.slice(1).toLowerCase();

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });

    user.skills.push({ skill, proficiency });
    await user.save();

    res.status(200).send({
      success: true,
      message: "Skill added successfully",
      data: user.skills,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Error adding skill",
        error: error.message,
      });
  }
};

// remove skill from user
export const removeSkill = async (req, res) => {
  try {
    const { id, skillId } = req.params;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const originalLength = user.skills.length;

    user.skills = user.skills.filter(
      (skill) => skill._id.toString() !== skillId
    );

    if (user.skills.length === originalLength) {
      return res.status(404).send({
        success: false,
        message: "Skill not found or already deleted",
      });
    }

    await user.save();

    res.status(200).send({
      success: true,
      message: "Skill deleted successfully",
      data: user.skills,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting skill",
      error: error.message,
    });
  }
};

// add education to user
export const addEducation = async (req, res) => {
  try {
    const userId = req.params.id;
    const newEducation = req.body;
    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });

    user.education.push(newEducation);
    await user.save();

    res.status(200).send({
      success: true,
      message: "Education added successfully",
      data: user.education,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Error adding education",
        error: error.message,
      });
  }
};
// remove education from user
export const removeEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    const userId = req.params.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const originalLength = user.education.length;
    user.education = user.education.filter(
      (edu) => edu._id.toString() !== eduId
    );

    if (user.education.length === originalLength) {
      return res.status(404).send({
        success: false,
        message: "Education entry not found",
      });
    }

    await user.save();

    res.status(200).send({
      success: true,
      message: "Education removed successfully",
      data: user.education,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error removing education",
      error: error.message,
    });
  }
};

// add education to user
export const addExperience = async (req, res) => {
  try {
    const userId = req.params.id;
    const newExperience = req.body; // { designation: "Software Engineer", companyName: "ABC Corp", startDate: "2020-01-01", endDate: "2021-01-01" }

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "User not found" });

    user.experience.push(newExperience);
    await user.save();

    res.status(200).send({
      success: true,
      message: "Experience added successfully",
      data: user.experience,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Error adding experience",
        error: error.message,
      });
  }
};
// remove experience from user
export const removeExperience = async (req, res) => {
  try {
    const { id, expId } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const originalLength = user.experience.length;

    // Filter out the experience by _id
    user.experience = user.experience.filter(
      (exp) => exp._id.toString() !== expId
    );

    // If nothing was removed
    if (user.experience.length === originalLength) {
      return res.status(404).send({
        success: false,
        message: "Experience not found or already deleted",
      });
    }

    await user.save();

    res.status(200).send({
      success: true,
      message: "Experience deleted successfully",
      data: user.experience,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting experience",
      error: error.message,
    });
  }
};

export const getAppliedJobsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .send({ success: false, message: "User ID is required" });
    }

    const appliedJobs = await ApplicationModel.find({ userId }).populate(
      "jobId"
    );

    if (appliedJobs.length === 0) {
      return res
        .status(404)
        .send({
          success: false,
          message: "No applied jobs found for this user",
        });
    }

    res.status(200).send({
      success: true,
      message: "Applied jobs retrieved successfully",
      data: appliedJobs,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error retrieving applied jobs",
      error: error.message,
    });
  }
};

// add resume to user
export const addResume = async (req, res) => {
  try {
    // console.log(req.file, 'req file');
    const userId = req.params.id;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .send({ success: false, message: "No resume file uploaded" });
    }

    // Upload to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "user_resumes",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload(file.buffer);

    // Update user's resume URL
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { resumeUrl: result.secure_url },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Resume uploaded and linked to user profile",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Error uploading resume",
        error: error.message,
      });
  }
};
// remove resume from user and cloudinary
export const removeResume = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    // Remove resume from user profile
    user.resumeUrl = undefined;
    await user.save();

    // Remove resume from Cloudinary
    const publicId = user.resumeUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`user_resumes/${publicId}`, {
      resource_type: "raw",
    });

    res.status(200).send({
      success: true,
      message: "Resume removed successfully",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        success: false,
        message: "Error removing resume",
        error: error.message,
      });
  }
};
export const applyJobByUser = async (req, res) => {
  try {
    const { jobId, userId } = req.params;
    const { adminId } = req.body; // यह मानकर चला कि adminId आपने request body से भेजा

    if (!jobId) {
      return res
        .status(400)
        .send({ success: false, message: "Job ID is required" });
    }

    // Check existing application
    const existingApplication = await ApplicationModel.findOne({
      userId,
      jobId,
    });
    if (existingApplication) {
      return res
        .status(400)
        .send({
          success: false,
          message: "You have already applied for this job",
        });
    }

    // Save new application
    const newApplication = await new ApplicationModel({
      userId,
      jobId,
      adminId,
    }).save();

    // === Notification Create ===
    await notificationModel.create({
      to: adminId,
      toModel: "Admin",
      type: "job_application",
      title: "New Job Application",
      message: `User (${userId}) has applied for job (${jobId})`,
      isRead: false,
      createdAt: new Date(),
    });
    // ==========================

    return res.status(201).send({
      success: true,
      message: "Job application submitted successfully, admin notified",
      data: newApplication,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error applying for job",
      error: error.message,
    });
  }
};

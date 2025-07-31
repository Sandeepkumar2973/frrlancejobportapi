import MootUserModel from "../models/MootUserModel.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import OTP from "../models/otpModel.js";

// 1️⃣ Send OTP
// export const sendOtp = async (req, res) => {
//   try {
//     const { mobile } = req.body;

//     if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
//       return res.status(400).json({ message: "Invalid mobile number" });
//     }

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     // Remove old OTPs for this mobile (optional)
//     await OTP.deleteMany({ mobile });

//     // Save new OTP
//     await OTP.create({ mobile, otp, otpExpiry });

//     // 👉 TODO: Integrate real SMS send here
//     // let msg = `Please use this code as your one-time password (OTP). It will expire in 3 minutes.\nYour OTP is ${OTP}.\nNever share your OTP with anyone`;

//     // await axios.get(
//     //   `https://www.bulksmsplans.com/api/verify?api_id=APIVf8Tq5w4115662&api_password=9Rtb6BLx&sms_type=Transactional&sms_encoding=text&sender=BLKSMS&number=123456789&message=Your bulksmsplanss Verification Code is : {{otp}}`
//     // );

//     res.status(200).json({ message: "OTP sent", otp }); // Remove OTP in production!
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to send OTP" });
//   }
// };
// Assuming you have an OTP model

export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log(mobile, "mobile");

    // Validate mobile number
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Remove any existing OTPs for this mobile
    await OTP.deleteMany({ mobile });

    // Save new OTP
    await OTP.create({ mobile, otp, otpExpiry });

    // Send SMS via BulkSMSPlans
    const smsApiUrl = `https://www.bulksmsplans.com/api/send_sms`;
    const smsParams = {
      api_id: "APIVf8Tq5w4115662",
      api_password: "9Rtb6BLx",
      sms_type: "Transactional",
      sms_encoding: "text",
      sender: "VLAWVS",
      number: `${mobile}`,
      message: `Your OTP is ${otp}. Valid for 10 minutes.`,
    };

    const response = await axios.post(smsApiUrl, smsParams, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // console.log(response.data, "SMS API Response");
    console.log(
      "Full SMS API Response:",
      JSON.stringify(response.data, null, 2)
    );

    // Check success from response
    if (response.data.code !== 200) {
      return res
        .status(500)
        .json({ message: "Failed to send SMS", error: response.data });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP Send Error:", err.message);
    res.status(500).json({ message: "Server error while sending OTP" });
  }
};

// 2️⃣ Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const otpRecord = await OTP.findOne({ mobile, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// 3️⃣ Register MootUser (final step)
export const registerMootUser = async (req, res) => {
  try {
    const { institution, email, mobile, password, teamMembers } = req.body;
    if (!institution || !email || !mobile || !password || !teamMembers) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // ✅ Check if user already exists
    const existingUser = await MootUserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // id generation logic can be customized as needed
    // LAWVS_M25_001 this type of ID can be  auto generated
    const MootCourtId = `LAWVS_M25_${Math.floor(Math.random() * 1000)}`;

    // ✅ Check OTP verified
    // const otpRecord = await OTP.findOne({ mobile, verified: true });
    // if (!otpRecord) {
    //   return res.status(400).json({ message: "Please verify OTP first" });
    // }

    // ✅ Create user
    const newUser = await MootUserModel.create({
      institution,
      email,
      mobile,
      password,
      teamMembers,
      MootCourtId,
    });

    // ✅ Remove OTP after success (optional)
    // await OTP.deleteMany({ mobile });

    res.status(201).json({
      message: "Moot user registered successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// export const registerMootUser = async (req, res) => {
//   try {
//     const { name, institution, course, pursuingYear, email, mobile, password } =
//       req.body;

//     // Check if user already exists
//     const existing = await MootUserModel.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "Email already registered." });
//     }

//     // Create new user
//     const newUser = new MootUserModel({
//       name,
//       institution,
//       course,
//       pursuingYear,
//       email,
//       mobile,
//       password,
//     });

//     await newUser.save();

//     res.status(201).json({
//       message: "Registration successful",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

export const loginMootUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await MootUserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get profile (protected)
export const getMootUser = async (req, res) => {
  try {
    const { mootUserId } = req.params;
    const user = await MootUserModel.findById(mootUserId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Moot Users (admin only)
export const getAllMootUsers = async (req, res) => {
  try {
    const users = await MootUserModel.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// add new fields by moot users in our details
// Update only self-editable fields
export const updateMootUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // from protect middleware
    const updates = req.body;

    const allowedFields = [
      "collegeId",
      "participations",
      "skills",
      "extraSkill",
      "linkedin",
      "twitter",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    const updatedUser = await MootUserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

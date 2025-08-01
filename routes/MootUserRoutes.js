import express from "express";
import {
  getMootUser,
  loginMootUser,
  MootresetPassword,
  MootsendOtpController,
  registerMootUser,
  sendOtp,
  updateMootUserProfile,
  verifyOtp,
  verifyOtpController,
} from "../controller/MootUserController.js";
import { requireSignIn, roleCheck, ROLES } from "../middleware/auth.js";

const router = express.Router();
// send otp....
router.post("/send-otp", MootsendOtpController);
// Verify OTP
router.post("/verify-otp", verifyOtpController);
// reset pass
router.post("/moot-user-newpass", MootresetPassword);
router.post("/mootuser_signup", registerMootUser);
router.post("/mootuser_login", loginMootUser);
router.get(
  "/get_mootuser_profile/:mootUserId",
  requireSignIn,
  roleCheck([ROLES.admin, ROLES.mootUser]),
  getMootUser
);
router.put(
  "/update_mootuser_profile",
  requireSignIn,
  roleCheck([ROLES.admin, ROLES.mootUser]),
  updateMootUserProfile
);

export default router;

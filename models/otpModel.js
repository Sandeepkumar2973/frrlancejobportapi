import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpiry: {
      type: Date,
      required: true,
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index: Document will expire when otpExpiry time is reached
otpSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;

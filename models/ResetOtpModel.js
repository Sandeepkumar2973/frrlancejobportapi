import mongoose from 'mongoose';

const resetOtpSchema = new mongoose.Schema({
    email: String,
    phone: String,
    otp: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP expires in 5 mins
    }
});

const ResetOtpModel = mongoose.model('ResetOtp', resetOtpSchema);
export default ResetOtpModel;

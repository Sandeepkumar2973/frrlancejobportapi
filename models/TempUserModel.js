import mongoose from 'mongoose';
// Temporary user schema for OTP verification
const tempUserSchema = new mongoose.Schema({
    email: String,
    fullName: String,
    phone: String,
    password: String,
    emailOtp: String,
    mobileOtp: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // auto delete after 5 minutes
    }
});

const TempUserModel = mongoose.model('TempUser', tempUserSchema);
export default TempUserModel;

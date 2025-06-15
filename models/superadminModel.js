import mongoose from 'mongoose';

const SuperAdminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'superadmin' },
    createdAt: { type: Date, default: Date.now }
});

const Super_Admin = mongoose.model('SuperAdmin', SuperAdminSchema);
export default Super_Admin;
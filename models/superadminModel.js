import mongoose from 'mongoose';

const SuperAdminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'superadmin' },
    createdAt: { type: Date, default: Date.now }
});

const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);
export default SuperAdmin;
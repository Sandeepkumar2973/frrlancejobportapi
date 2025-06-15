import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    companyName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'active' }, // active/inactive
    role: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;

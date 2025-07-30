import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  Image: String,
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: "active" },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;

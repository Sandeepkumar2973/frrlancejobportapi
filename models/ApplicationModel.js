import mongoose from 'mongoose';
const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    coverLetter: String,
    status: { type: String, enum: ['Applied', 'Viewed', 'Shortlisted','Rejected'], default: 'Applied' },
    appliedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;

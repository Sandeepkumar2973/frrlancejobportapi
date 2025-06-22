import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: String,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    company: String,
    location: String,
    postedDate: Date,
    openings: Number,
    salaryRange: String,
    jobType: String,
    workMode: String,
    experienceRequired: String,
    skillsRequired: [String],
    description: String,
    industry: String,
    deadline: Date,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Jobs = mongoose.model('Job', JobSchema);
export default Jobs;

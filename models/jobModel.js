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
    experienceRequired: String,
    skillsRequired: [String],
    description: String,
    industry: String,
    category: String,
});

const Jobs = mongoose.model('Job', JobSchema);
export default Jobs;

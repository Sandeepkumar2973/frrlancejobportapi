import mongoose from 'mongoose';
const educationSchema = new mongoose.Schema({
    degree: String,
    degreeType: String,
    specialization: String,
    university: String,
    startYear: Number,
    endYear: Number,
    ongoing: Boolean,
    grade: String,
});

const experienceSchema = new mongoose.Schema({
    designation: String,
    companyName: String,
    employmentType: String,
    ctc: Number,
    industry: String,
    domain: String,
    startDate: Date,
    endDate: Date,
    currentlyWorking: Boolean,
    location: String,
    responsibilities: String,
});

const skillSchema = new mongoose.Schema({
    skill: String,
    proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'] },
});

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    image: String,
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: false },
    password: { type: String, required: false },
    profilePicture: String,
    dob: Date,
    gender: String,
    currentLocation: String,
    preferredLocations: [String],
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [skillSchema],
    resumeUrl: String,
    profileCompleted: { type: Boolean, default: false },
    role: { type: String, default: 'user' },
    isVerified: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;

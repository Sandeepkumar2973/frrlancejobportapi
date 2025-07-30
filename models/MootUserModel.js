import mongoose from "mongoose";
import bcrypt from "bcrypt";

const mootUserSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
    password: { type: String, required: true },
    role: { type: String, default: "mootUser" },

    teamMembers: [
      {
        role: { type: String, enum: ["speaker1", "speaker2", "researcher"], required: true },
        name: { type: String, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        university: { type: String, required: true },
        year: { type: String, required: true },
        course: { type: String, required: true },
        contact: { type: String, required: true },
        collegeId: { type: String, required: true },
        certificate: { type: String },
      },
    ],
    participations: [
      {
        competitionName: String,
        role: String,
        position: String,
        year: Number,
      },
    ],
    totalPoints: { type: Number, default: 0 },
    badges: [String],
    skills: [String],
    extraSkill: String,
    linkedin: String,
    twitter: String,
    MootCourtId:{type:String, require:true, unique: true},
  },
  { timestamps: true }
);

mootUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

mootUserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const MootUser = mongoose.model("MootUser", mootUserSchema);
export default MootUser;

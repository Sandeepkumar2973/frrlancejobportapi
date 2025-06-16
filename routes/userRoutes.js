import express from 'express';
import { addEducation, addExperience, addResume, addSkill, applyJobByUser, createUser, createUserByOtpVery, deleteUserById, filterUser, forgotPassSendOtp, getallUser, getAppliedJobsByUserId, getUserById, loginUser, removeEducation, removeExperience, removeResume, removeSkill, resetPassword, updateUserProfile, verifyOtp } from '../controller/userControllers.js';
import multer from 'multer';
import upload from '../middleware/multer.js';
import { requireSignIn, roleCheck, ROLES } from '../middleware/auth.js';

const router = express.Router();
// router.post('/create-user', createUser);
router.post('/login-user', loginUser);
router.get('/get-all-users', requireSignIn, roleCheck([ROLES.admin], [ROLES.superadmin]), getallUser); // Assuming this is meant to get all users
router.get('/get-user-byId/:id', requireSignIn, roleCheck([ROLES.admin], [ROLES.superadmin]), getUserById);
router.delete('/delete-user-byId/:id', requireSignIn, roleCheck([ROLES.admin], [ROLES.superadmin]), deleteUserById)
router.get('/filter', requireSignIn, roleCheck([ROLES.admin], [ROLES.superadmin]), filterUser);
router.post('/sent-otp-register', createUserByOtpVery);
// Verify OTPs and create final user
router.post('/verify-otp', verifyOtp);
router.post('/forgot-Send-Otp', forgotPassSendOtp);
router.post('/reset-password', resetPassword);
router.put('/update-user/:id', requireSignIn, roleCheck([ROLES.user]), updateUserProfile); // Moved to the end to avoid confusion with OTP verification

// Skills
router.put('/:id/add-skill', requireSignIn, roleCheck([ROLES.user]), addSkill);
router.delete('/:id/delete-skill/:skillId', roleCheck([ROLES.user]), requireSignIn, removeSkill);

// Experience
router.put('/:id/add-experience', requireSignIn, roleCheck([ROLES.user]), addExperience);
router.delete('/:id/delete-experience/:expId', requireSignIn, roleCheck([ROLES.user]), removeExperience);
// education
router.put('/:id/add-education', requireSignIn, roleCheck([ROLES.user]), addEducation);
router.delete('/:id/delete-education/:eduId', requireSignIn, roleCheck([ROLES.user]), removeEducation);
router.post('/job-apply/:jobId/:userId', applyJobByUser)
router.get('/get-apply-jobBy/:userId', requireSignIn, roleCheck([ROLES.user]), getAppliedJobsByUserId)


router.post('/:id/resume', upload.single('resume'), requireSignIn, roleCheck([ROLES.user]), addResume);

router.delete('/:id/resume-delete/:resumeId', requireSignIn, roleCheck([ROLES.user]), removeResume)

export default router;
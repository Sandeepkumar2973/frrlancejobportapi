import express from 'express';
import { countUniqueApplicantsByAdmin, createAdminByOtpVery, createAmin, deleteAdmin, forgotPassSendOtp, getAdminByID, getAllAdmins, getApplicantsByDate, getApplicationCountByAdmin, getUserApplicationById, loginAdmin, resetPassword, updateAdmin, verifyOtp } from '../controller/adminControllers.js';
import { changeApplicationStatus } from '../controller/ApplicationControllers.js';
import { requireSignIn, roleCheck, ROLES } from '../middleware/auth.js';
const router = express.Router();



router.post('/create-admin', createAmin);
router.post('/login-admin', loginAdmin);
// router.get('/get-all-admin', requireSignIn, roleCheck([ROLES.superadmin]), getAllAdmins);
// router.get('/get-admin-byid/:id', requireSignIn, roleCheck([ROLES.admin, ROLES.superadmin]), getAdminByID);
// router.delete('/delete-admin-byId/:id', requireSignIn, roleCheck([ROLES.superadmin]), deleteAdmin)
// router.put('/update-admin-byId/:id', requireSignIn, roleCheck([ROLES.admin]), updateAdmin);
router.post('/sent-otp', createAdminByOtpVery);
router.post('/verify-otp-create', verifyOtp);
router.post('/sent-otp-forgt-pass', forgotPassSendOtp);
router.post('/reset-admin', resetPassword);
// router.get('/get-userBy-application/:adminId', requireSignIn, roleCheck([ROLES.admin]), getUserApplicationById); // Assuming this is meant to get user by application
// router.post('/change-application-status/:applicationId', requireSignIn, roleCheck([ROLES.admin]), changeApplicationStatus);
// counting application
// router.get('/application-count/:adminId', getApplicationCountByAdmin);

// router .get('/get')
//user count
// router.get('/applicant-user-count/:adminId', countUniqueApplicantsByAdmin);
// router.get('/applicant-bydate-count/:adminId', getApplicantsByDate);

export default router;
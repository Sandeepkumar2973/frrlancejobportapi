import express from 'express';
import { createJob, deleteJobById, getAllJobs, getJobById, getJobCountByAdmin, getJobsByAdminId, updateJobById } from '../controller/jobControllers.js';
import { get } from 'mongoose';
import { requireSignIn, roleCheck, ROLES } from '../middleware/auth.js';
const router = express.Router();

// router.post('/create-job', requireSignIn, roleCheck([ROLES.admin]), createJob)
// router.get('/get-all-jobs', getAllJobs);
// router.get('/get-job-byId/:id', getJobById);
// router.delete('/delete-job-byId/:id', requireSignIn, roleCheck([ROLES.admin], [ROLES.superadmin]), deleteJobById)
// router.put('/update-job-byId/:id', requireSignIn, roleCheck([ROLES.admin]), updateJobById);
// router.get('/get-job-byAdminId/:id', requireSignIn, roleCheck([ROLES.admin]), getJobsByAdminId);
// router.get('/job-count/:id', getJobCountByAdmin);


export default router;
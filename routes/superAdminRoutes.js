import express from 'express';
import { createSuperAdmin, getAllAdminsCounts, getAllApplicantsCounts, getAllJobsCounts, getAllUsersCounts, loginSuperAdmin } from '../controller/superAdminControllers.js';

const router = express.Router();

// router.post('/create-super-admin', createSuperAdmin);
// router.post('/login-super-admin', loginSuperAdmin);
// router.get('/getAll-AdminCount', getAllAdminsCounts);
// router.get('/getAll-JobCount', getAllJobsCounts);
// router.get('/getAll-userCount', getAllUsersCounts);
// router.get('/getAll-application', getAllApplicantsCounts);


export default router;
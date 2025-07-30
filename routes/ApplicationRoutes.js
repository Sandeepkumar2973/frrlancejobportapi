import express from 'express';
import { getUserApplicationById } from '../controller/ApplicationControllers';
import { requireSignIn } from '../middleware/auth';
const router = express.Router();

// router.get('/get-userBy-application/:jobId',requireSignIn, getUserApplicationById);
export default router;
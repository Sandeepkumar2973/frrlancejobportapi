import express from 'express';
import { createSuperAdmin, loginSuperAdmin } from '../controller/superAdminControllers';

const router = express.Router();

router.post('/create-super-admin',createSuperAdmin);
router.post('/login-super-admin',loginSuperAdmin);

export default router;
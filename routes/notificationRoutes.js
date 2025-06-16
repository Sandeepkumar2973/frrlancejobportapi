import express from "express";
import { deleteNotification, getNotificationsForAdmin, getNotificationsForUser } from "../controller/notificationController.js";
import { requireSignIn, roleCheck, ROLES } from "../middleware/auth.js";


const router = express.Router();

// GET notifications for Admin
router.get("/admin/:adminId", requireSignIn, roleCheck([ROLES.admin]), getNotificationsForAdmin);

// GET notifications for User
router.get("/user/:userId", requireSignIn, roleCheck([ROLES.user]), getNotificationsForUser);
router.delete("/delete/:notificationId",requireSignIn, roleCheck([ROLES.admin]), deleteNotification);


export default router;

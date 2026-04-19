import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new NotificationController();

// Get my notifications
router.get("/", authenticate, (req, res) => controller.getMyNotifications(req, res));

// Mark single notification as read
router.patch("/:id/read", authenticate, (req, res) => controller.markAsRead(req, res));

// Mark all as read
router.patch("/read-all", authenticate, (req, res) => controller.markAllAsRead(req, res));

// Delete notification
router.delete("/:id", authenticate, (req, res) => controller.delete(req, res));

export default router;

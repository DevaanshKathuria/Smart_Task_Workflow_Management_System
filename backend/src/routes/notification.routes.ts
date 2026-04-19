import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const controller = new NotificationController();

// Get my notifications
router.get("/", authenticate, (req, res) => controller.getMyNotifications(req, res));

// Mark ALL as read — must be before /:id routes to avoid "read-all" being matched as :id
router.patch("/read-all", authenticate, (req, res) => controller.markAllAsRead(req, res));

// Mark single notification as read
router.patch("/:id/read", authenticate, (req, res) => controller.markAsRead(req, res));

// Delete notification
router.delete("/:id", authenticate, (req, res) => controller.delete(req, res));

export default router;

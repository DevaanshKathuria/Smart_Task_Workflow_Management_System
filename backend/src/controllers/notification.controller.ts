import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

interface AuthRequest extends Request {
  user?: any;
}

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user.userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const notification = await notificationService.markAsRead(Number(req.params.id));
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await notificationService.markAllAsRead(req.user.userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await notificationService.deleteNotification(Number(req.params.id));
      res.json({ message: "Notification deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

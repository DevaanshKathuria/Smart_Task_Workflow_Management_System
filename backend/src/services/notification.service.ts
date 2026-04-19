import { NotificationRepository } from "../repositories/notification.repository";

const notificationRepository = new NotificationRepository();

export class NotificationService {
  async getUserNotifications(userId: number) {
    return notificationRepository.findByUser(userId);
  }

  async markAsRead(id: number) {
    return notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: number) {
    return notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: number) {
    return notificationRepository.delete(id);
  }
}

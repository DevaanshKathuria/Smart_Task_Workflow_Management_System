import prisma from "../config/prisma";

export class NotificationRepository {
  async create(data: { message: string; userId: number }) {
    return prisma.notification.create({ data });
  }

  async findByUser(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: number) {
    return prisma.notification.delete({ where: { id } });
  }
}

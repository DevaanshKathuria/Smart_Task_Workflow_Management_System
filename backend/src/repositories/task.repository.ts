import prisma from "../config/prisma";

export class TaskRepository {
  async create(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: Date;
    projectId: number;
    assignedToId?: number;
  }) {
    return prisma.task.create({
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async findAll() {
    return prisma.task.findMany({
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByProject(projectId: number) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUser(userId: number) {
    return prisma.task.findMany({
      where: { assignedToId: userId },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async update(
    id: number,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: Date;
      assignedToId?: number | null;
    }
  ) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: number) {
    return prisma.task.delete({ where: { id } });
  }
}

import prisma from "../config/prisma";

export class ProjectRepository {
  async create(data: { name: string; description?: string; managerId: number; startDate?: Date; endDate?: Date }) {
    return prisma.project.create({
      data,
      include: { manager: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll() {
    return prisma.project.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        tasks: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async update(id: number, data: { name?: string; description?: string; startDate?: Date; endDate?: Date }) {
    return prisma.project.update({
      where: { id },
      data,
      include: { manager: { select: { id: true, name: true, email: true } } },
    });
  }

  async delete(id: number) {
    return prisma.project.delete({ where: { id } });
  }
}

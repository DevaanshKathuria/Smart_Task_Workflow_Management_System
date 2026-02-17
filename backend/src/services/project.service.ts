import prisma from "../config/prisma";

export class ProjectService {
  async createProject(name: string, description: string | undefined, managerId: number) {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        managerId,
      },
    });

    return project;
  }

  async getAllProjects() {
    return prisma.project.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
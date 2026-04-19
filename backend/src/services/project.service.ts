import { ProjectRepository } from "../repositories/project.repository";

const projectRepository = new ProjectRepository();

export class ProjectService {
  async createProject(
    name: string,
    description: string | undefined,
    managerId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    return projectRepository.create({ name, description, managerId, startDate, endDate });
  }

  async getAllProjects() {
    return projectRepository.findAll();
  }

  async getProjectById(id: number) {
    const project = await projectRepository.findById(id);
    if (!project) throw new Error("Project not found");
    return project;
  }

  async updateProject(
    id: number,
    data: { name?: string; description?: string; startDate?: Date; endDate?: Date }
  ) {
    const project = await projectRepository.findById(id);
    if (!project) throw new Error("Project not found");
    return projectRepository.update(id, data);
  }

  async deleteProject(id: number) {
    const project = await projectRepository.findById(id);
    if (!project) throw new Error("Project not found");
    return projectRepository.delete(id);
  }
}
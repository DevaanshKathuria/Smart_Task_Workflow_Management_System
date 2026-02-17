import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const { name, description, managerId } = req.body;

      if (!name || !managerId) {
        return res.status(400).json({ message: "Name and managerId required" });
      }

      const project = await projectService.createProject(
        name,
        description,
        Number(managerId)
      );

      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  }
}
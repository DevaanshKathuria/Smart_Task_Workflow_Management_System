import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const { name, description, managerId, startDate, endDate } = req.body;
      if (!name || !managerId) {
        return res.status(400).json({ message: "Name and managerId are required" });
      }
      const project = await projectService.createProject(
        name,
        description,
        Number(managerId),
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid project ID" });
      const project = await projectService.getProjectById(id);
      res.json(project);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid project ID" });
      const { name, description, startDate, endDate } = req.body;
      const project = await projectService.updateProject(id, {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid project ID" });
      await projectService.deleteProject(id);
      res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

interface AuthRequest extends Request {
  user?: any;
}

export class TaskController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;
      if (!title || !projectId) {
        return res.status(400).json({ message: "Title and projectId are required" });
      }
      const task = await taskService.createTask({
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId: Number(projectId),
        assignedToId: assignedToId ? Number(assignedToId) : undefined,
      });
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const tasks = await taskService.getAllTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getByProject(req: Request, res: Response) {
    try {
      const tasks = await taskService.getTasksByProject(Number(req.params.projectId));
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMyTasks(req: AuthRequest, res: Response) {
    try {
      const tasks = await taskService.getTasksByUser(req.user.userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const task = await taskService.getTaskById(Number(req.params.id));
      res.json(task);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { title, description, status, priority, dueDate, assignedToId } = req.body;
      const task = await taskService.updateTask(Number(req.params.id), {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId: assignedToId !== undefined ? (assignedToId ? Number(assignedToId) : null) : undefined,
      });
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await taskService.deleteTask(Number(req.params.id));
      res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

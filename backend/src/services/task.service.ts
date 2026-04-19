import { TaskRepository } from "../repositories/task.repository";
import { NotificationRepository } from "../repositories/notification.repository";

const taskRepository = new TaskRepository();
const notificationRepository = new NotificationRepository();

const VALID_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export class TaskService {
  async createTask(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: Date;
    projectId: number;
    assignedToId?: number;
  }) {
    if (data.status && !VALID_STATUSES.includes(data.status)) {
      throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }

    const task = await taskRepository.create(data);

    // Auto-notify assigned user
    if (data.assignedToId) {
      await notificationRepository.create({
        message: `You have been assigned a new task: "${task.title}"`,
        userId: data.assignedToId,
      });
    }

    return task;
  }

  async getAllTasks() {
    return taskRepository.findAll();
  }

  async getTasksByProject(projectId: number) {
    return taskRepository.findByProject(projectId);
  }

  async getTasksByUser(userId: number) {
    return taskRepository.findByUser(userId);
  }

  async getTaskById(id: number) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");
    return task;
  }

  async updateTask(
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
    const existing = await taskRepository.findById(id);
    if (!existing) throw new Error("Task not found");

    if (data.status && !VALID_STATUSES.includes(data.status)) {
      throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }

    const updated = await taskRepository.update(id, data);

    // Notify on status change
    if (data.status && data.status !== existing.status && existing.assignedToId) {
      await notificationRepository.create({
        message: `Task "${existing.title}" status updated to ${data.status}`,
        userId: existing.assignedToId,
      });
    }

    // Notify on new assignment
    if (
      data.assignedToId &&
      data.assignedToId !== existing.assignedToId
    ) {
      await notificationRepository.create({
        message: `You have been assigned a task: "${existing.title}"`,
        userId: data.assignedToId,
      });
    }

    return updated;
  }

  async deleteTask(id: number) {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task not found");
    return taskRepository.delete(id);
  }
}

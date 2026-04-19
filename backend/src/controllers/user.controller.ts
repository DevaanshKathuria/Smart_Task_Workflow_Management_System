import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

interface AuthRequest extends Request {
  user?: any;
}

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.findAll();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await userRepository.findById(Number(req.params.id));
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await userRepository.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const validRoles = ["ADMIN", "MANAGER", "EMPLOYEE"];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ message: "Valid role is required (ADMIN, MANAGER, EMPLOYEE)" });
      }
      const user = await userRepository.updateRole(Number(req.params.id), role);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
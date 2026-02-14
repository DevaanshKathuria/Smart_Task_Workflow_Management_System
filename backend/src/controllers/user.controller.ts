import { Request, Response } from "express";
import prisma from "../config/prisma";

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  }
}
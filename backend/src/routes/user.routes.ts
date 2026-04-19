import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new UserController();

// Get current user profile
router.get("/me", authenticate, (req, res) => controller.getMe(req, res));

// Get all users — Admin only
router.get("/", authenticate, authorize("ADMIN"), (req, res) => controller.getAllUsers(req, res));

// Get user by ID — Admin only
router.get("/:id", authenticate, authorize("ADMIN"), (req, res) => controller.getById(req, res));

// Update user role — Admin only
router.patch("/:id/role", authenticate, authorize("ADMIN"), (req, res) => controller.updateRole(req, res));

export default router;
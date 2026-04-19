import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new ProjectController();

// Create project — Admin or Manager only
router.post("/", authenticate, authorize("ADMIN", "MANAGER"), (req, res) => controller.create(req, res));

// Get all projects — authenticated
router.get("/", authenticate, (req, res) => controller.getAll(req, res));

// Get project by ID — authenticated
router.get("/:id", authenticate, (req, res) => controller.getById(req, res));

// Update project — Admin or Manager only
router.put("/:id", authenticate, authorize("ADMIN", "MANAGER"), (req, res) => controller.update(req, res));

// Delete project — Admin only
router.delete("/:id", authenticate, authorize("ADMIN"), (req, res) => controller.delete(req, res));

export default router;
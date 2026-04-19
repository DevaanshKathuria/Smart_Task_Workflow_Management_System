import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new TaskController();

// Get my tasks (logged-in user's assigned tasks)
router.get("/my", authenticate, (req, res) => controller.getMyTasks(req, res));

// Get all tasks — authenticated
router.get("/", authenticate, (req, res) => controller.getAll(req, res));

// Get tasks by project
router.get("/project/:projectId", authenticate, (req, res) => controller.getByProject(req, res));

// Get task by ID
router.get("/:id", authenticate, (req, res) => controller.getById(req, res));

// Create task — Admin or Manager
router.post("/", authenticate, authorize("ADMIN", "MANAGER"), (req, res) => controller.create(req, res));

// Update task — Admin, Manager or assigned Employee
router.put("/:id", authenticate, (req, res) => controller.update(req, res));

// Delete task — Admin or Manager
router.delete("/:id", authenticate, authorize("ADMIN", "MANAGER"), (req, res) => controller.delete(req, res));

export default router;

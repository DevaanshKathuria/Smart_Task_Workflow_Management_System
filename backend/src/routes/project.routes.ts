import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new ProjectController();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  (req, res) => controller.create(req, res)
);

router.get(
  "/",
  authenticate,
  (req, res) => controller.getAll(req, res)
);

export default router;
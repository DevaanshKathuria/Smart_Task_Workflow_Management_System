import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new UserController();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  (req, res) => controller.getAllUsers(req, res)
);

export default router;
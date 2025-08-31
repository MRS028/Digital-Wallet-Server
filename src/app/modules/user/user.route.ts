import { Router } from "express";
import { validateRequest } from "../../middlewares/validateUserRequest";
import { UserController } from "./user.controller";
import { createUserSchema } from "./user.zodValidation";

const router = Router();
router.post(
  "/register",
  validateRequest(createUserSchema),
  UserController.createUser
);

router.get(
  "/all-users",
  UserController.getAllUsers
);

export const UserRoutes = router;
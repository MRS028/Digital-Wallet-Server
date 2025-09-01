import { Router } from "express";
import { validateRequest } from "../../middlewares/validateUserRequest";
import { UserController } from "./user.controller";
import { createUserSchema } from "./user.zodValidation";
import { UserRole } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserSchema),
  UserController.createUser
);

router.post(
  "/add-money",
  checkAuth(UserRole.USER),
  UserController.addMoney
);

router.post(
  "/withdraw-money",
  checkAuth(UserRole.USER),
  UserController.withdrawMoney
);

router.post(
  "/send-money",
  checkAuth(UserRole.USER),
  UserController.sendMoney
);

router.get(
  "/transaction-history",
  checkAuth(UserRole.USER),
  UserController.getTransactionHistory
);

router.get(
  "/all-users",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only admins can view all users
  UserController.getAllUsers
);

export const UserRoutes = router;
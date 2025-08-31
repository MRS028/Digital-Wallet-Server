import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { User } from "./user.model";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);
    sendResponse(res, {
      success: true,
      httpStatus: httpStatus.CREATED,
      message: "User created successfully",
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserService.getAllUsers();
    sendResponse(res, {
      success: true,
      httpStatus: httpStatus.OK,
      message: "Users retrieved successfully",
      data: users,
      meta: { totalUsers: users.meta.totalUsers },
    });
  }
);

export const UserController = {
  createUser,
  getAllUsers,
};

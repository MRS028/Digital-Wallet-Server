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
      meta: { total: users?.meta?.totalUsers },
    });
  }
);

const addMoney = catchAsync(async (req: Request, res: Response) => {
  const { amount } = req.body;
  const { transaction, newBalance } = await UserService.addMoney(req.user.id, amount);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Money added successfully',
    data: { transaction, newBalance },
  });
});

const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
  const { amount } = req.body;
  const { transaction, newBalance } = await UserService.withdrawMoney(req.user.id, amount);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Money withdrawn successfully',
    data: { transaction, newBalance },
  });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const { receiverPhoneNumber, amount } = req.body;
  const { transaction, newBalance } = await UserService.sendMoney(req.user.id, receiverPhoneNumber, amount);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Money sent successfully',
    data: { transaction, newBalance },
  });
});

const getTransactionHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getTransactionHistory(req.user.id);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Transaction history fetched successfully',
    data: result,
  });
});

const getWalletBalance = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getWalletBalance(req.user.id);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Wallet balance fetched successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  addMoney,
  withdrawMoney,
  sendMoney,
  getTransactionHistory,
  getWalletBalance,
};

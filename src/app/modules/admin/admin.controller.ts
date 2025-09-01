import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { AdminService } from './admin.service';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'All users fetched successfully',
    data: result,
  });
});

const getAllAgents = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAgents();
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'All agents fetched successfully',
    data: result,
  });
});

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllWallets();
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'All wallets fetched successfully',
    data: result,
  });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllTransactions();
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'All transactions fetched successfully',
    data: result,
  });
});

const blockUserWallet = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await AdminService.blockUserWallet(userId);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'User wallet blocked successfully',
    data: result,
  });
});

const unblockUserWallet = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await AdminService.unblockUserWallet(userId);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'User wallet unblocked successfully',
    data: result,
  });
});

const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const result = await AdminService.approveAgent(agentId); // Assuming adminId is not directly passed to service for now
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Agent approved successfully',
    data: result,
  });
});

const suspendAgent = catchAsync(async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const result = await AdminService.suspendAgent(agentId);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Agent suspended successfully',
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  getAllAgents,
  getAllWallets,
  getAllTransactions,
  blockUserWallet,
  unblockUserWallet,
  approveAgent,
  suspendAgent,
};
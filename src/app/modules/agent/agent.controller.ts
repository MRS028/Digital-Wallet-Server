import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { AgentService } from './agent.service';

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const { receiverPhoneNumber, amount } = req.body;
  const { transaction, agentNewBalance } = await AgentService.cashIn(req.user.id, receiverPhoneNumber, amount);
  const formattedAgentNewBalance = agentNewBalance.toFixed(3);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Cash-in completed successfully',
    data: { transaction, agentNewBalance: formattedAgentNewBalance },
  });
});

const cashOut = catchAsync(async (req: Request, res: Response) => {
  const { senderPhoneNumber, amount } = req.body;
  const { transaction, agentNewBalance } = await AgentService.cashOut(req.user.id, senderPhoneNumber, amount);
  const formattedAgentNewBalance = agentNewBalance.toFixed(3);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Cash-out completed successfully',
    data: { transaction, agentNewBalance: formattedAgentNewBalance },
  });
});

const getCommissionHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await AgentService.getCommissionHistory(req.user.id);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Commission history retrieved successfully',
    data: result,
  });
});

const getWalletBalance = catchAsync(async (req: Request, res: Response) => {
  const result = await AgentService.getWalletBalance(req.user.id);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Agent wallet balance retrieved successfully',
    data: result,
  });
});

export const AgentController = {
  cashIn,
  cashOut,
  getCommissionHistory,
  getWalletBalance,
};
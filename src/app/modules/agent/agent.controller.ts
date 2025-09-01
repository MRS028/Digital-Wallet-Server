import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { AgentService } from './agent.service';
 // Assuming AgentService will be created

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const { receiverPhoneNumber, amount } = req.body;
  const result = await AgentService.cashIn(req.user.id, receiverPhoneNumber, amount);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Cash-in completed successfully',
    data: result,
  });
});

const cashOut = catchAsync(async (req: Request, res: Response) => {
  const { senderPhoneNumber, amount } = req.body;
  const result = await AgentService.cashOut(req.user.id, senderPhoneNumber, amount);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Cash-out completed successfully',
    data: result,
  });
});

const getCommissionHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await AgentService.getCommissionHistory(req.user.id);
  sendResponse(res, {
    httpStatus: httpStatus.OK,
    success: true,
    message: 'Commission history fetched successfully',
    data: result,
  });
});

export const AgentController = {
  cashIn,
  cashOut,
  getCommissionHistory,
};
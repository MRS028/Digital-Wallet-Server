import mongoose from 'mongoose';
import { Wallet } from '../wallet/wallet.model';
import { Transaction } from '../transaction/transaction.model';
import { TransactionStatus, TransactionType } from '../transaction/transaction.interface';
import { User } from '../user/user.model';
import { UserRole, isActive } from '../user/user.interface';
import { agentStatus } from './agent.interface';
import { envVars } from '../../config/env';
import AppError from '../../errorHelper/customErrror';
import httpStatus from 'http-status';

const cashIn = async (agentId: string, receiverPhoneNumber: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate Agent (now a User with AGENT role)
    const agent = await User.findOne({ _id: agentId, role: UserRole.AGENT }).session(session);
    if (!agent || agent.status !== agentStatus.ACTIVE) {
      throw new AppError('Agent is not active or does not exist', httpStatus.FORBIDDEN);
    }

    // 2. Validate Receiver (User)
    const receiver = await User.findOne({ phoneNumber: receiverPhoneNumber }).session(session);
    if (!receiver || receiver.isActive !== isActive.ACTIVE) {
      throw new AppError('Receiver user is not active or does not exist', httpStatus.NOT_FOUND);
    }

    // 3. Get Receiver's Wallet
    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(session);
    if (!receiverWallet || receiverWallet.status !== isActive.ACTIVE) {
      throw new AppError('Receiver wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // 4. Calculate Fee and Commission
    const transactionFee = Number(envVars.TRANSACTION_FEE || 0);
    const agentCommissionRate = agent.commissionRate || Number(envVars.AGENT_COMMISSION || 0);
    const commissionAmount = (amount * agentCommissionRate) / 100;

    // 5. Update Receiver's Wallet Balance
    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

    // 6. Create Transaction Record
    const transaction = await Transaction.create(
      [
        {
          sender: agent._id, // Agent is the sender in terms of initiating the cash-in
          receiver: receiver._id,
          amount: amount,
          type: TransactionType.CASH_IN,
          status: TransactionStatus.COMPLETED,
          fee: transactionFee,
          commission: commissionAmount,
          initiatedBy: agent._id,
          initiatedByRole: UserRole.AGENT,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return { transaction: transaction[0], newBalance: receiverWallet.balance };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cashOut = async (agentId: string, senderPhoneNumber: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate Agent (now a User with AGENT role)
    const agent = await User.findOne({ _id: agentId, role: UserRole.AGENT }).session(session);
    if (!agent || agent.status !== agentStatus.ACTIVE) {
      throw new AppError('Agent is not active or does not exist', httpStatus.FORBIDDEN);
    }

    // 2. Validate Sender (User)
    const sender = await User.findOne({ phoneNumber: senderPhoneNumber }).session(session);
    if (!sender || sender.isActive !== isActive.ACTIVE) {
      throw new AppError('Sender user is not active or does not exist', httpStatus.NOT_FOUND);
    }

    // 3. Get Sender's Wallet
    const senderWallet = await Wallet.findOne({ user: sender._id }).session(session);
    if (!senderWallet || senderWallet.status !== isActive.ACTIVE) {
      throw new AppError('Sender wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // 4. Check for Sufficient Balance
    if (senderWallet.balance < amount) {
      throw new AppError('Insufficient balance in sender wallet', httpStatus.BAD_REQUEST);
    }

    // 5. Calculate Fee and Commission
    const transactionFee = Number(envVars.TRANSACTION_FEE || 0);
    const agentCommissionRate = agent.commissionRate || Number(envVars.AGENT_COMMISSION || 0);
    const commissionAmount = (amount * agentCommissionRate) / 100;

    // 6. Update Sender's Wallet Balance
    senderWallet.balance -= amount;
    await senderWallet.save({ session });

    // 7. Create Transaction Record
    const transaction = await Transaction.create(
      [
        {
          sender: sender._id,
          receiver: agent._id, // Agent is the receiver in terms of initiating the cash-out
          amount: amount,
          type: TransactionType.CASH_OUT,
          status: TransactionStatus.COMPLETED,
          fee: transactionFee,
          commission: commissionAmount,
          initiatedBy: agent._id,
          initiatedByRole: UserRole.AGENT,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return { transaction: transaction[0], newBalance: senderWallet.balance };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getCommissionHistory = async (agentId: string) => {
  const commissionHistory = await Transaction.find({
    initiatedBy: agentId,
    initiatedByRole: UserRole.AGENT,
    type: TransactionType.COMMISSION, // Or CASH_IN/CASH_OUT where commission was earned
  }).populate('sender receiver initiatedBy'); // Populate sender and receiver details

  return commissionHistory;
};

const getWalletBalance = async (agentId: string) => {
  const agentWallet = await Wallet.findOne({ user: agentId });
  if (!agentWallet) {
    throw new AppError('Agent wallet not found', httpStatus.NOT_FOUND);
  }
  if (agentWallet.status !== isActive.ACTIVE) {
    throw new AppError('Agent wallet is not active', httpStatus.BAD_REQUEST);
  }
  return { balance: agentWallet.balance };
};

export const AgentService = {
  cashIn,
  cashOut,
  getCommissionHistory,
  getWalletBalance,
};
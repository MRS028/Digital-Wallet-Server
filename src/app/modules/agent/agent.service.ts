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
    const agent = await User.findOne({ _id: agentId, role: UserRole.AGENT }).session(session);
    if (!agent || agent.status !== agentStatus.ACTIVE) {
      throw new AppError('Agent is not active or does not exist', httpStatus.FORBIDDEN);
    }
    const agentWallet = await Wallet.findOne({ user: agent._id }).session(session);
    if (!agentWallet || agentWallet.status !== isActive.ACTIVE) {
      throw new AppError('Agent wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }


    if (agentWallet.balance < amount) {
      throw new AppError('Agent has insufficient balance to perform cash-in', httpStatus.BAD_REQUEST);
    }

    const receiver = await User.findOne({ phoneNumber: receiverPhoneNumber }).session(session);
    if (!receiver || receiver.isActive !== isActive.ACTIVE) {
      throw new AppError('Receiver user is not active or does not exist', httpStatus.NOT_FOUND);
    }

    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(session);
    if (!receiverWallet || receiverWallet.status !== isActive.ACTIVE) {
      throw new AppError('Receiver wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }


    const transactionFee = Number(envVars.TRANSACTION_FEE || 0);
    const agentCommissionRate = agent.commissionRate || Number(envVars.AGENT_COMMISSION || 0);
    const commissionAmount = (amount * agentCommissionRate) / 100;


    agentWallet.balance -= amount;
    agentWallet.balance += commissionAmount;
    receiverWallet.balance += amount - transactionFee;

    await agentWallet.save({ session });
    await receiverWallet.save({ session });

    const transaction = await Transaction.create(
      [
        {
          sender: agent._id,
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

    return { transaction: transaction[0], agentNewBalance: agentWallet.balance };
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
    // validate agent
    const agent = await User.findOne({ _id: agentId, role: UserRole.AGENT }).session(session);
    if (!agent || agent.status !== agentStatus.ACTIVE) {
      throw new AppError('Agent is not active or does not exist', httpStatus.FORBIDDEN);
    }

    // agent wallet
    const agentWallet = await Wallet.findOne({ user: agent._id }).session(session);
    if (!agentWallet || agentWallet.status !== isActive.ACTIVE) {
      throw new AppError('Agent wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // validate sender
    const sender = await User.findOne({ phoneNumber: senderPhoneNumber }).session(session);
    if (!sender || sender.isActive !== isActive.ACTIVE) {
      throw new AppError('Sender user is not active or does not exist', httpStatus.NOT_FOUND);
    }

    // sender wallet
    const senderWallet = await Wallet.findOne({ user: sender._id }).session(session);
    if (!senderWallet || senderWallet.status !== isActive.ACTIVE) {
      throw new AppError('Sender wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // check sender's balance for cash-out
    if (senderWallet.balance < amount) {
      throw new AppError('Insufficient balance in sender wallet', httpStatus.BAD_REQUEST);
    }

    // calculate fee and commission
    const transactionFee = Number(envVars.TRANSACTION_FEE || 0);
    const agentCommissionRate = agent.commissionRate || Number(envVars.AGENT_COMMISSION || 0);
    const commissionAmount = (amount * agentCommissionRate) / 100;

    // update wallets
    senderWallet.balance -= amount + transactionFee;
    agentWallet.balance += amount - commissionAmount;

    await senderWallet.save({ session });
    await agentWallet.save({ session });

    // 8. Create Transaction Record
    const transaction = await Transaction.create(
      [
        {
          sender: sender._id,
          receiver: agent._id,
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

    return { transaction: transaction[0], agentNewBalance: agentWallet.balance };
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
    $or: [
      { type: TransactionType.CASH_IN, commission: { $gt: 0 } },
      { type: TransactionType.CASH_OUT, commission: { $gt: 0 } },
    ],
  }).populate('sender receiver initiatedBy'); 

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
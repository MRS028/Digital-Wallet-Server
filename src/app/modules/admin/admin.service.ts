import { User } from '../user/user.model';
import { Wallet } from '../wallet/wallet.model';
import { Transaction } from '../transaction/transaction.model';
import { isActive, UserRole } from '../user/user.interface';
import { agentStatus } from '../agent/agent.interface';
import AppError from '../../errorHelper/customErrror';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

const getAllUsers = async () => {
  const users = await User.find({ role: UserRole.USER });
  return users;
};

const getAllAgents = async () => {
  const agents = await User.find({ role: UserRole.AGENT });
  return agents;
};

const getAllWallets = async () => {
  const wallets = await Wallet.find({}).populate('user');
  return wallets;
};

const getAllTransactions = async () => {
  const transactions = await Transaction.find({}).populate('sender receiver initiatedBy');
  return transactions;
};

const blockUserWallet = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userWallet = await Wallet.findOne({ user: userId }).session(session);
    if (!userWallet) {
      throw new AppError('User wallet not found', httpStatus.NOT_FOUND);
    }
    if (userWallet.status === isActive.BLOCKED) {
      throw new AppError('User wallet is already blocked', httpStatus.BAD_REQUEST);
    }
    userWallet.status = isActive.BLOCKED;
    await userWallet.save({ session });

    await session.commitTransaction();
    session.endSession();
    return userWallet;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const unblockUserWallet = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userWallet = await Wallet.findOne({ user: userId }).session(session);
    if (!userWallet) {
      throw new AppError('User wallet not found', httpStatus.NOT_FOUND);
    }
    if (userWallet.status === isActive.ACTIVE) {
      throw new AppError('User wallet is already active', httpStatus.BAD_REQUEST);
    }
    userWallet.status = isActive.ACTIVE;
    await userWallet.save({ session });

    await session.commitTransaction();
    session.endSession();
    return userWallet;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const approveAgent = async (agentId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await User.findOne({ _id: agentId, role: UserRole.AGENT }).session(session);
    if (!agent) {
      throw new AppError('Agent not found', httpStatus.NOT_FOUND);
    }
    if (agent.status === agentStatus.ACTIVE) {
      throw new AppError('Agent is already active', httpStatus.BAD_REQUEST);
    }
    agent.status = agentStatus.ACTIVE;
    agent.approvalDate = new Date();
    // agent.approvedBy = adminId; // Assuming adminId will be passed from controller
    await agent.save({ session });

    await session.commitTransaction();
    session.endSession();
    return agent;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const suspendAgent = async (agentId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await User.findOne({ _id: agentId, role: UserRole.AGENT }).session(session);
    if (!agent) {
      throw new AppError('Agent not found', httpStatus.NOT_FOUND);
    }
    if (agent.status === agentStatus.SUSPENDED) {
      throw new AppError('Agent is already suspended', httpStatus.BAD_REQUEST);
    }
    agent.status = agentStatus.SUSPENDED;
    await agent.save({ session });

    await session.commitTransaction();
    session.endSession();
    return agent;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const AdminService = {
  getAllUsers,
  getAllAgents,
  getAllWallets,
  getAllTransactions,
  blockUserWallet,
  unblockUserWallet,
  approveAgent,
  suspendAgent,
};
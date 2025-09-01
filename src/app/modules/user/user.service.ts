import mongoose from 'mongoose';
import { Wallet } from '../wallet/wallet.model';
import { Transaction } from '../transaction/transaction.model';
import { TransactionStatus, TransactionType } from '../transaction/transaction.interface';
import { User } from './user.model';
import { UserRole, isActive } from './user.interface';
import { envVars } from '../../config/env';
import AppError from '../../errorHelper/customErrror';
import httpStatus from 'http-status';

const addMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate User
    const user = await User.findById(userId).session(session);
    if (!user || user.isActive !== isActive.ACTIVE) {
      throw new AppError('User is not active or does not exist', httpStatus.FORBIDDEN);
    }

    // 2. Get User's Wallet
    const userWallet = await Wallet.findOne({ user: user._id }).session(session);
    if (!userWallet || userWallet.status !== isActive.ACTIVE) {
      throw new AppError('User wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // 3. Update User's Wallet Balance
    userWallet.balance += amount;
    await userWallet.save({ session });

    // 4. Create Transaction Record
    const transaction = await Transaction.create(
      [
        {
          receiver: user._id,
          amount: amount,
          type: TransactionType.ADD_MONEY,
          status: TransactionStatus.COMPLETED,
          fee: 0, // No fee for adding money
          commission: 0, // No commission for adding money
          initiatedBy: user._id,
          initiatedByRole: UserRole.USER,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return { transaction: transaction[0], newBalance: userWallet.balance };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const withdrawMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate User
    const user = await User.findById(userId).session(session);
    if (!user || user.isActive !== isActive.ACTIVE) {
      throw new AppError('User is not active or does not exist', httpStatus.FORBIDDEN);
    }

    // 2. Get User's Wallet
    const userWallet = await Wallet.findOne({ user: user._id }).session(session);
    if (!userWallet || userWallet.status !== isActive.ACTIVE) {
      throw new AppError('User wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // 3. Check for Sufficient Balance
    if (userWallet.balance < amount) {
      throw new AppError('Insufficient balance in user wallet', httpStatus.BAD_REQUEST);
    }

    // 4. Calculate Fee
    const transactionFee = Number(envVars.TRANSACTION_FEE || 0);
    const totalAmountToDeduct = amount + transactionFee;

    if (userWallet.balance < totalAmountToDeduct) {
      throw new AppError('Insufficient balance to cover withdrawal and fee', httpStatus.BAD_REQUEST);
    }

    // 5. Update User's Wallet Balance
    userWallet.balance -= totalAmountToDeduct;
    await userWallet.save({ session });

    // 6. Create Transaction Record
    const transaction = await Transaction.create(
      [
        {
          sender: user._id,
          receiver: user._id, // Self-transfer for withdrawal
          amount: amount,
          type: TransactionType.WITHDRAW,
          status: TransactionStatus.COMPLETED,
          fee: transactionFee,
          commission: 0,
          initiatedBy: user._id,
          initiatedByRole: UserRole.USER,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return { transaction: transaction[0], newBalance: userWallet.balance };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const sendMoney = async (senderId: string, receiverPhoneNumber: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate Sender
    const sender = await User.findById(senderId).session(session);
    if (!sender || sender.isActive !== isActive.ACTIVE) {
      throw new AppError('Sender user is not active or does not exist', httpStatus.FORBIDDEN);
    }

    // 2. Validate Receiver
    const receiver = await User.findOne({ phoneNumber: receiverPhoneNumber }).session(session);
    if (!receiver || receiver.isActive !== isActive.ACTIVE) {
      throw new AppError('Receiver user is not active or does not exist', httpStatus.NOT_FOUND);
    }

    // 3. Ensure sender and receiver are not the same
    if (sender._id.toString() === receiver._id.toString()) {
      throw new AppError('Cannot send money to yourself', httpStatus.BAD_REQUEST);
    }

    // 4. Get Sender's Wallet
    const senderWallet = await Wallet.findOne({ user: sender._id }).session(session);
    if (!senderWallet || senderWallet.status !== isActive.ACTIVE) {
      throw new AppError('Sender wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // 5. Get Receiver's Wallet
    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(session);
    if (!receiverWallet || receiverWallet.status !== isActive.ACTIVE) {
      throw new AppError('Receiver wallet is not active or does not exist', httpStatus.BAD_REQUEST);
    }

    // 6. Calculate Fee
    const transactionFee = Number(envVars.TRANSACTION_FEE || 0);
    const totalAmountToDeduct = amount + transactionFee;

    // 7. Check for Sufficient Balance
    if (senderWallet.balance < totalAmountToDeduct) {
      throw new AppError('Insufficient balance in sender wallet', httpStatus.BAD_REQUEST);
    }

    // 8. Update Wallets
    senderWallet.balance -= totalAmountToDeduct;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    // 9. Create Transaction Record
    const transaction = await Transaction.create(
      [
        {
          sender: sender._id,
          receiver: receiver._id,
          amount: amount,
          type: TransactionType.SEND_MONEY,
          status: TransactionStatus.COMPLETED,
          fee: transactionFee,
          commission: 0,
          initiatedBy: sender._id,
          initiatedByRole: UserRole.USER,
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

const getTransactionHistory = async (userId: string) => {
  const transactionHistory = await Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).populate('sender receiver');

  return transactionHistory;
};

const createUser = async (payload: any) => {
  // Placeholder for actual user creation logic, including wallet creation
  const newUser = await User.create(payload);
  // Automatically create a wallet for the new user
  await Wallet.create({ user: newUser._id, balance: Number(envVars.INITIAL_BALANCE) });
  return newUser;
};

const getAllUsers = async () => {
  // Placeholder for actual get all users logic
  const users = await User.find({});
  return {
    data: users,
    meta: {
      totalUsers: users.length,
    },
  };
};

const getWalletBalance = async (userId: string) => {
  const userWallet = await Wallet.findOne({ user: userId });
  if (!userWallet) {
    throw new AppError('User wallet not found', httpStatus.NOT_FOUND);
  }
  if (userWallet.status !== isActive.ACTIVE) {
    throw new AppError('User wallet is not active', httpStatus.BAD_REQUEST);
  }
  return { balance: userWallet.balance };
};

export const UserService = {
  createUser,
  getAllUsers,
  addMoney,
  withdrawMoney,
  sendMoney,
  getTransactionHistory,
  getWalletBalance,
};

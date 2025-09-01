import { Types } from 'mongoose';
import { UserRole } from '../user/user.interface';

export enum TransactionType {
  ADD_MONEY = 'add_money',
  WITHDRAW = 'withdraw',
  SEND_MONEY = 'send_money',
  CASH_IN = 'cash_in',
  CASH_OUT = 'cash_out',
  COMMISSION = 'commission',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REVERSED = 'reversed',
  FAILED = 'failed',
}

export interface ITransaction {
  sender: Types.ObjectId; 
  receiver: Types.ObjectId; 
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  fee: number;
  commission: number;
  initiatedBy: Types.ObjectId; 
  initiatedByRole: UserRole; 
  reference?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}
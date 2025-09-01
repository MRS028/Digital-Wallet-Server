import { model, Schema } from 'mongoose';
import { ITransaction, TransactionStatus, TransactionType } from './transaction.interface';
import { UserRole } from '../user/user.interface';

const transactionSchema = new Schema<ITransaction>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, 
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },
    commission: {
      type: Number,
      default: 0,
      min: [0, 'Commission cannot be negative'],
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    initiatedByRole: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    reference: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
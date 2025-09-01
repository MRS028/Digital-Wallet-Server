import { model, Schema } from 'mongoose';
import { IWallet } from './wallet.interface';
import { isActive } from '../user/user.interface';
import { envVars } from '../../config/env';

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User', 
    },
    balance: {
      type: Number,
      required: true,
      default: Number(envVars.INITIAL_BALANCE), 
      min: [0, 'Balance cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(isActive),
      default: isActive.ACTIVE,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Wallet = model<IWallet>('Wallet', walletSchema);
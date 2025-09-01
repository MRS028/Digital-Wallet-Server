import { Types } from 'mongoose';
import { isActive } from '../user/user.interface';

export interface IWallet {
  user: Types.ObjectId; // Reference to User or Agent
  balance: number;
  status: isActive; // Using isActive enum from user.interface.ts for wallet status
  createdAt?: Date;
  updatedAt?: Date;
}
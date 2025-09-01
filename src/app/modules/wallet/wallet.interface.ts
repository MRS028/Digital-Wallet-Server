import { Types } from 'mongoose';
import { isActive } from '../user/user.interface';

export interface IWallet {
  user: Types.ObjectId; 
  balance: number;
  status: isActive; 
  createdAt?: Date;
  updatedAt?: Date;
}
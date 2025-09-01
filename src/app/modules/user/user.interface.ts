export enum UserRole {
  USER = "USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface IAuthProvider {
  provider: "google" | "facebook" | "twitter" | "github" | "credentials";
  providerId: string;
}

export enum isActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  BLOCKED = "BLOCKED",
}
export interface IUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}


import { agentStatus } from '../agent/agent.interface'; // Import agentStatus

export interface IUser {
  name: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role: UserRole;
  address?: string;
  picture?: string;
  isActive: isActive;
  isVerified: boolean;
  auths: IAuthProvider[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Agent-specific fields (optional, only if role is AGENT)
  agentCode?: string;
  status?: agentStatus; // Using agentStatus for agent's status
  commissionRate?: number;
  approvalDate?: Date;
  approvedBy?: string; // Reference to Admin user ID
}

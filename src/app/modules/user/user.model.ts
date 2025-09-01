import { model, Schema } from "mongoose";
import { IAuthProvider, isActive, IUser, UserRole } from "./user.interface";
import { agentStatus } from "../agent/agent.interface"; // Import agentStatus
import { envVars } from "../../config/env"; // Import envVars

export const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      required: true,
    },
    providerId: { type: String, required: true },
  },
  { _id: false, versionKey: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    address: { type: String },
    picture: { type: String },
    isActive: {
      type: String,
      enum: Object.values(isActive),
      default: isActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    auths: [authProviderSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Agent-specific fields
    agentCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to not violate unique constraint
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z0-9]{6,10}$/,
        "Agent code must be 6-10 characters long and contain only uppercase letters and numbers",
      ],
    },
    status: {
      type: String,
      enum: Object.values(agentStatus),
      default: agentStatus.PENDING,
    },
    commissionRate: {
      type: Number,
      default: Number(envVars.AGENT_COMMISSION),
      min: [0, "Commission rate cannot be negative"],
      max: [10, "Commission rate cannot exceed 10%"],
    },
    approvalDate: {
      type: Date,
    },
    approvedBy: {
      type: String,
      ref: "User", // Reference to an Admin User
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);

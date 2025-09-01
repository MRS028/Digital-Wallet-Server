import { model, Schema } from "mongoose";
import { agentStatus, IAgent } from "./agent.interface";
import { authProviderSchema } from "../user/user.model";
import { isActive, UserRole } from "../user/user.interface";
import { envVars } from "../../config/env";

const agentSchema = new Schema<IAgent>(
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
      required: [true, "Agent code is required"],
      unique: true,
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
      required: true,
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
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

agentSchema.index({ status: 1 });
agentSchema.index({ commissionRate: 1 });

export const Agent = model<IAgent>("Agent", agentSchema);

import httpStatus from "http-status-codes";
import customError from "../../errorHelper/customErrror";
import { User } from "../user/user.model";
import { IUser } from "../user/user.interface";
import { IAgent } from "../agent/agent.interface";
import bcryptjs from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

import { Wallet } from "../wallet/wallet.model";
import { Agent } from "../agent/agent.model";
import { UserRole } from "../user/user.interface";
import { envVars } from "../../config/env";
import mongoose from "mongoose";

const registerUser = async (payload: Partial<IUser>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { password, role, ...userData } = payload;

    // Hash password
    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );

    let newUser;
    if (role === UserRole.AGENT) {
      // Agent-specific registration
      const agentPayload = payload as Partial<IAgent>;
      const { agentCode, ...agentData } = agentPayload;
      newUser = await Agent.create(
        [
          {
            ...agentData,
            password: hashedPassword,
            role: UserRole.AGENT,
            agentCode: agentCode as string, // Ensure agentCode is treated as string
          },
        ],
        { session }
      );
    } else {
      // User registration
      newUser = await User.create(
        [
          {
            ...userData,
            password: hashedPassword,
            role: role || UserRole.USER,
          },
        ],
        { session }
      );
    }

    if (!newUser || newUser.length === 0) {
      throw new customError("Failed to create user/agent", httpStatus.BAD_REQUEST);
    }

    // Create wallet for the new user/agent
    await Wallet.create(
      [
        {
          user: newUser[0]._id,
          balance: Number(envVars.INITIAL_BALANCE),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Generate JWT token for the newly registered user/agent
    const jwtPayload = {
      id: newUser[0]._id,
      email: newUser[0].email,
      role: newUser[0].role,
    };
    const accessToken = jwt.sign(jwtPayload, envVars.JWT_SECRET, {
      expiresIn: envVars.JWT_EXPIRES_IN,
    } as SignOptions);

    return {
      user: newUser[0],
      accessToken,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  // Validate user credentials
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    throw new customError("User does not exist", httpStatus.BAD_REQUEST);
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new customError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }
  const jwtPayload = {
    id: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const accessToken = jwt.sign(jwtPayload, envVars.JWT_SECRET, {
    expiresIn: envVars.JWT_EXPIRES_IN} as SignOptions,
  );

  return {
    accessToken
  }
};

export const AuthService = {
  registerUser,
  credentialsLogin
};

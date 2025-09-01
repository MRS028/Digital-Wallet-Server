import httpStatus from "http-status-codes";
import customError from "../../errorHelper/customErrror";
import { User } from "../user/user.model";
import { IUser } from "../user/user.interface";
import { agentStatus } from "../agent/agent.interface";
import bcryptjs from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

import { Wallet } from "../wallet/wallet.model";
import { UserRole } from "../user/user.interface";
import { envVars } from "../../config/env";
import mongoose from "mongoose";

const registerUser = async (payload: Partial<IUser>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { password, role, ...otherData } = payload;
    const email = payload.email;
    const phoneNumber = payload.phoneNumber;
    const existingUserWithEmail = await User.findOne({ email, role: { $ne: UserRole.AGENT } }).session(session);
    const existingAgentWithEmail = await User.findOne({ email, role: UserRole.AGENT }).session(session);
    if (existingUserWithEmail || existingAgentWithEmail) {
      throw new customError("Email already registered", httpStatus.CONFLICT);
    }

    if (phoneNumber) {
      const existingUserWithPhone = await User.findOne({ phoneNumber, role: { $ne: UserRole.AGENT } }).session(session);
      const existingAgentWithPhone = await User.findOne({ phoneNumber, role: UserRole.AGENT }).session(session);
      if (existingUserWithPhone || existingAgentWithPhone) {
        throw new customError("Phone number already registered", httpStatus.CONFLICT);
      }
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );

    let newUser;
    if (role === UserRole.AGENT) {
      const agentData = { ...otherData, email, phoneNumber };
      const lastAgent = await User.findOne({ role: UserRole.AGENT }, {}, { sort: { 'createdAt': -1 } }).session(session);
      let newAgentCode = 'AGENT001';
      if (lastAgent && lastAgent.agentCode) {
        const lastCodeNum = parseInt(lastAgent.agentCode.replace('AGENT', ''));
        newAgentCode = 'AGENT' + String(lastCodeNum + 1).padStart(3, '0');
      }

      newUser = await User.create( 
        [
          {
            ...agentData,
            password: hashedPassword,
            role: UserRole.AGENT,
            agentCode: newAgentCode,
            status: agentStatus.PENDING, 
            commissionRate: Number(envVars.AGENT_COMMISSION),
          },
        ],
        { session }
      );
    } else {
      newUser = await User.create(
        [
          {
            ...otherData,
            email: email as string,
            phoneNumber: phoneNumber as string,
            password: hashedPassword,
            role: role || UserRole.USER,
          },
        ],
        { session }
      );
    }

    if (!newUser || newUser.length === 0 || !newUser[0]._id) {
      throw new customError("Failed to create user/agent or retrieve user ID", httpStatus.BAD_REQUEST);
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

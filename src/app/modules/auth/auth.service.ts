import httpStatus from "http-status-codes";
import customError from "../../errorHelper/customErrror";
import { User } from "../user/user.model";
import { IUser } from "../user/user.interface";
import bcryptjs from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  // Validate user credentials
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    throw new customError("User  does not exist", httpStatus.BAD_REQUEST);
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
  credentialsLogin
};

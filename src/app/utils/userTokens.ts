import httpStatus  from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import customError from "../errorHelper/customErrror";

export const createUserToken = (user: Partial<IUser>) => {
  const JwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    JwtPayload,
    envVars.JWT_SECRET,
    envVars.JWT_EXPIRES_IN
  );
  const refreshToken = generateToken(
    JwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES_IN
  );
  return { accessToken, refreshToken };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload ;
  const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });
  if (!isUserExist) {
    throw new customError("User does not exist", httpStatus.BAD_REQUEST, );
  }

  if (isUserExist.isActive === "INACTIVE") {
    throw new customError("User is inactive", httpStatus.UNAUTHORIZED);
  }
  if (isUserExist.isActive === "BLOCKED") {
    throw new customError("User is blocked", httpStatus.UNAUTHORIZED);
  }
  if (isUserExist.isDeleted) {
    throw new customError("User is deleted", httpStatus.UNAUTHORIZED);
  }

  const JwtPayload = {
    id: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = generateToken(
    JwtPayload,
    envVars.JWT_SECRET,
    envVars.JWT_EXPIRES_IN
  );

  return {
    accessToken,
  };
};
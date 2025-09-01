import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import customError from "../errorHelper/customErrror";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        throw new customError("No token provided", httpStatus.UNAUTHORIZED);
      }
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_SECRET
      ) as JwtPayload;
      if (!authRoles.includes(verifiedToken.role)) {
        throw new customError(
          "You are not authorized to access this resource",
          httpStatus.FORBIDDEN
        );
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      // console.error("Error in checkAuth middleware:", error);
      throw new customError(
        "Internal server error",
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
  };

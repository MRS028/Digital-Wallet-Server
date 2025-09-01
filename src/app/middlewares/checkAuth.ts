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
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new customError("No token provided", httpStatus.UNAUTHORIZED);
      }

      // Extract token only
      const token = authHeader.split(" ")[1];

      // Verify token
      const verifiedToken = verifyToken(
        token,
        envVars.JWT_SECRET
      ) as JwtPayload;

      // Check role if roles are provided
      if (authRoles.length > 0 && !authRoles.includes(verifiedToken.role)) {
        throw new customError(
          "You are not authorized to access this resource",
          httpStatus.FORBIDDEN
        );
      }

      // Attach user info to request
      (req as any).user = verifiedToken;

      next();
    } catch (error: any) {
      console.error("Auth error:", error.message);

      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return next(new customError("Invalid or expired token", httpStatus.UNAUTHORIZED));
      }

      if (error instanceof customError) {
        return next(error); // preserve custom errors like unauthorized/forbidden
      }

      return next(
        new customError("Internal server error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  };

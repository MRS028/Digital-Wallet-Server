import httpStatus from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import customError from "../errorHelper/customErrror";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new customError("No token provided", httpStatus.UNAUTHORIZED);
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new customError("Token is missing", httpStatus.UNAUTHORIZED);
      }

      let verifiedToken: JwtPayload;

      try {
        verifiedToken = verifyToken(token, envVars.JWT_SECRET) as JwtPayload;
      } catch (err: any) {
        // JWT-specific errors
        if (err.name === "JsonWebTokenError") {
          throw new customError("Invalid token", httpStatus.UNAUTHORIZED);
        }
        if (err.name === "TokenExpiredError") {
          throw new customError("Token expired", httpStatus.UNAUTHORIZED);
        }
        // Other unknown JWT errors
        throw new customError("Internal server error", httpStatus.INTERNAL_SERVER_ERROR);
      }

      // Role-based check
      if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
        throw new customError(
          "You are not authorized to access this resource",
          httpStatus.FORBIDDEN
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error: any) {
      next(error); // Pass all errors to global error handler
    }
  };

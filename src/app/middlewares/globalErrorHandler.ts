import { NextFunction, Request, Response } from "express";
import customError from "../errorHelper/customErrror";
import { envVars } from "../config/env";

export const globalErrorHandlers = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";

  if (error instanceof customError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    statusCode = 500;
    message = error.message;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: `${error.message}`,
    error,
    stack: envVars.NODE_ENV === "development" ? error.stack : null,
  });
};

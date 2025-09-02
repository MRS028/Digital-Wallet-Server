import { NextFunction, Request, Response } from "express";
import customError from "../errorHelper/customErrror";
import { envVars } from "../config/env";

export const globalErrorHandlers = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // default values
  let statusCode = 500;
  let message = "Something went wrong";

  if (error instanceof customError) {
    statusCode = error.statusCode;
    message = error.message || "Unexpected error occurred";
  } else if (error instanceof Error) {
    message = error.message || "Unexpected server error";
  }

  const responsePayload: Record<string, any> = {
    success: false,
    message,
    statusCode,

  };

  // Always show stack trace and error name for debugging
  responsePayload.stack = error.stack;
  responsePayload.errorName = error.name;

  // Optionally, keep the development-only check if desired for production
  // if (envVars.NODE_ENV === "development") {
  //   responsePayload.stack = error.stack;
  //   responsePayload.errorName = error.name;
  // }

  res.status(statusCode).json(responsePayload);
};

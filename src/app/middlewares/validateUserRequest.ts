import { NextFunction, Request, Response } from "express";
import { ZodTypeAny, ZodObject } from "zod";

export const validateRequest = (zodSchema: ZodTypeAny) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = await zodSchema.parseAsync(req.body); // validated & parsed data
    next();
  } catch (error: any) {
    // Custom error response
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors || error.message,
    });
  }
};

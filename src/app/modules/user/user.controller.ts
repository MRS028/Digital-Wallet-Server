import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";

const createUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User

    }
)
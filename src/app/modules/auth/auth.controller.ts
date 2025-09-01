import httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from './auth.service';



const credentialsLogin = catchAsync(
    async (req:Request,res:Response,next:NextFunction) => {
        const loginInfo = await AuthService.credentialsLogin(req.body);

        sendResponse(res , {
            success: true,
            httpStatus: httpStatus.OK,
            data: loginInfo,
            message: "Login successful"
        })
    }
);

const register = catchAsync(
    async (req:Request,res:Response,next:NextFunction) => {
        const newUser = await AuthService.registerUser(req.body);

        sendResponse(res , {
            success: true,
            httpStatus: httpStatus.CREATED,
            data: newUser,
            message: "User registered successfully"
        })
    }
);

export const AuthController = {
    register,
    credentialsLogin
};
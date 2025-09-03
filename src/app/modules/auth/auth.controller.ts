import httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from './auth.service';
import { setAuthCookie } from '../../utils/setCookie';
import customError from '../../errorHelper/customErrror';



const credentialsLogin = catchAsync(
    async (req:Request,res:Response,next:NextFunction) => {
        const loginInfo = await AuthService.credentialsLogin(req.body);
         setAuthCookie(res, loginInfo);


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

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    // const refreshToken = req.headers.authorization;
    if (!refreshToken) {
      throw new customError("Please provide refresh token", httpStatus.UNAUTHORIZED);
    }
    const tokeninfo = await AuthService.getNewAccessToken(
      refreshToken as string
    );
    setAuthCookie(res, tokeninfo.accessToken);

    sendResponse(res, {
      success: true,
      httpStatus: httpStatus.OK,
      message: "New access token generated successfully",
      data: tokeninfo,
    });
  }
);

export const AuthController = {
    register,
    credentialsLogin,
    getNewAccessToken
};
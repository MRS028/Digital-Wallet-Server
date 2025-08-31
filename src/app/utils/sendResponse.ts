import { Response } from "express";

interface TMeta {
    totalUsers: number;
}
interface TResponse<T> {
    success: boolean;
    httpStatus: number;
    message: string;
    data: T;
    meta?: TMeta;
}

export const sendResponse = <T>(res: Response, response: TResponse<T>) => {
    res.status(response.httpStatus).json(
        {
            success: response.success,
            httpStatus: response.httpStatus,
            message: response.message,
            data: response.data,
            meta: response.meta
        }
    );
}
import httpStatus from 'http-status-codes';
import customError from "../../errorHelper/customErrror";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from 'bcryptjs';
import { envVars } from '../../config/env';


const createUser = async (payload: Partial<IUser>) => {
    const {email,password,...rest} = payload;
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new customError("User already exists",httpStatus.CONFLICT);
    }
   
    //password hashing
    const hashedPassword = await bcryptjs.hash(password as string, envVars.BCRYPT_SALT_ROUNDS);
    
    const authProvider: IAuthProvider ={
        provider: "credentials",
        providerId: email as string,
    }

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest,
        auths: [authProvider]
    })

};


const getAllUsers = async () => {
    const users = await User.find({});
    const totalUsers = await User.countDocuments({});
    return { data: users, meta: { totalUsers } };
}

export const UserService = {
    createUser,
    getAllUsers
};
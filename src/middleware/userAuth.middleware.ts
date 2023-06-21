import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../util/ErrorHandler";

import jwt from 'jsonwebtoken'
import { AppDataSource } from "..";
import {User} from "../entities/User";

interface JwtPayload {
    id: number;
}



export const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
                const decoded = await jwt.verify(token, process.env.SECRET!) as JwtPayload;
                if (decoded) {
                    const userId = decoded.id;
                    const user =await AppDataSource.getRepository(User).findOne({
                        where:{
                            id:userId
                        }
                    })
                    if (!user) return next(new ErrorHandler('Not Authorized', 401))
                    req.body.user = user;
                    return next();
                }
                else {
                    return next(new ErrorHandler('Not Authorized', 401))
                }
            }
            else {
                return next(new ErrorHandler('Not Authorized', 401))
            }
        }
        else {
            return next(new ErrorHandler('Not Authorized', 401))
        }
    }

    catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}
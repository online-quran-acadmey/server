import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../util/ErrorHandler";

import jwt from 'jsonwebtoken'
import { AppDataSource } from "..";

interface JwtPayload {
    id: string;
}



export const tutorAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            if (token) { 
                    
                const decoded =await jwt.verify(token, process.env.TUTOR_SECRET!) as JwtPayload
                if (decoded) {

                   const tutorId = decoded.id;

                    const tutor = AppDataSource.getRepository('Tutor').findOneBy({ id: tutorId })
                    
                    if (!tutor) return next(new ErrorHandler('Not Authorized', 401))
                    
                    req.body.tutor = tutor;

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
        
    catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
     }
}


import { NextFunction, Request, Response } from "express"
import { AppDataSource } from "..";
import jsonWebToken from "jsonwebtoken"
import { ErrorHandler } from "../util/ErrorHandler";
import { generateToken } from "../util/generateToken";
import { User } from "../entities/User";


export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { firstName, middleName, lastName, email, password, dateOfBirth, gender, address, contactNumber, parentGuardianName, parentGuardianContact } = req.body;
    const User = AppDataSource.getRepository("User");
    if (!firstName || !lastName || !email || !password) {
        return next(new ErrorHandler("Please Enter All Required Fields", 400))
    }
    const isUserExistByEmail = await User.findOne({
        where: {
            email
        }
    })

    if (isUserExistByEmail) {
        return next(new ErrorHandler("User Already Register", 400))
    }

    const newUser = User.create({
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: email,
        password: password,
        dateOfBirth: dateOfBirth,
        gender: gender,
        address: address,
        contactNumber: contactNumber,
        parentGuardianName: parentGuardianName,
        parentGuardianContact: parentGuardianContact,
    });

    const savedUser = await User.save(newUser,);

    const user = await User.findOne({
        where: {
            id: savedUser.id
        },
        relations: ['coursesEnrolled']
    })

    const token = jsonWebToken.sign(savedUser.id, process.env.SECRET!);

    res.status(201).json({
        success: true,
        message: "User Registered",
        token,
        user
    })
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;

    try {
        const userRepo = AppDataSource.getRepository(User);

        if (!email || !password) {
            return next(new ErrorHandler("All Fields Required", 400))
        }

        const user = await userRepo.findOne({
            where: {
                email
            },
            relations: ['coursesEnrolled', 'requestedCourses']
        })

        if (user) {
            const match = await user.verifyPassword(password);
            console.log(match)

            if (match) {

                const token = await generateToken(user.id, process.env.SECRET!)

                return res.json({
                    success: true,
                    message: "Login Success",
                    token,
                    user
                })
            }
            if (!match) {
                return next(new ErrorHandler("Username or Password Incorrect", 400))
            }
        }

        return next(new ErrorHandler("Username or Password Incorrect", 400))
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}


export const viewUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const id = req.query.id;

        const userRepo = AppDataSource.getRepository('User');
        console.log(id)
        if (id) {
            const user = await userRepo.findOne({
                where: {
                    id: id
                },
                select: {
                    id: true,
                    name: true,
                    fatherName: true,
                    email: true,
                    age: true,
                    username: true
                }
            })

            return res.json({
                success: true,
                user
            })
        }
        else {
            const user = await userRepo.find({
                select: {
                    id: true,
                    name: true,
                    fatherName: true,
                    email: true,
                    age: true,
                    username: true
                }
            })

            return res.json({
                success: true,
                user
            })

        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name, fatherName, age, email, username } = req.body;

    try {

        const userRepo = AppDataSource.getRepository('User');

        const user = await userRepo.findOne({
            where: {
                id: req.query.id
            },
        })

        if (user) {
            await userRepo.update(user.id, {
                name,
                fatherName,
                age,
                username,
                email
            })

            return res.json({
                success: true,
                message: "Updated Successfully"
            })
        }

        return next(new ErrorHandler("User Not Found", 400))
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }

}

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {

        const id: string = req.params.id;

        const userRepo = AppDataSource.getRepository('User');

        const user = await userRepo.findOne({
            where: {
                id
            }
        });

        if (user) {
            await userRepo.delete(id);
            return res.json({
                success: true,
                message: "User Deleted Successfully"
            })
        }

        return next(new ErrorHandler("User Not Found", 400))
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}



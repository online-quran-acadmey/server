import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../util/ErrorHandler';
import { AppDataSource } from '..';
import { generateToken } from '../util/generateToken';
import {Tutor} from "../entities/Tutor";





export const createTutor = async (req: Request, res: Response, next: NextFunction) => {
    const { firstName,middleName,lastName, email, phoneNumber, password, biography, specialization,gender,dateOfBirth,idCard,address } = req.body;

    try {

        const tutorRepo = AppDataSource.getRepository(Tutor)

        const newTutor = tutorRepo.create({
            firstName,middleName,lastName, email, phoneNumber, password, biography, specialization,gender,dateOfBirth,idCard,address
        })

        const savedTutor = await tutorRepo.save(newTutor)
        const token = await generateToken(savedTutor.id, process.env.TUTOR_SECRET!);

        return res.status(201).json({
            success: true,
            message: 'Tutor created successfully',
            token,
            user: savedTutor
        })


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }

}


export const tutorLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return next(new ErrorHandler('Please provide email and password', 400))
        }

        const tutorRepo = AppDataSource.getRepository(Tutor)
        const tutor = await tutorRepo.findOne({ where: { email },relations:['courses'] })

        if (!tutor) {
            return next(new ErrorHandler('Invalid credentials', 401))
        }

        const isMatch = await tutor.verifyPassword(password)

        if (!isMatch) {
            return next(new ErrorHandler('Invalid credentials', 401))
        }

        const token = await generateToken(tutor.id, process.env.TUTOR_SECRET!)

        return res.status(200).json({
            success: true,
            message: 'Tutor logged in successfully',
            token,
            tutor
        })

    }


    catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}

export const getTutorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tutorRepo = AppDataSource.getRepository(Tutor)
        const tutor = await tutorRepo.findOne({ where: { id: parseInt(req.params.id) } })

        if (!tutor) {
            return next(new ErrorHandler('Tutor not found', 404))
        }

        return res.status(200).json({
            success: true,
            tutor
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }

}

export const updateTutorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, phoneNumber, password, biography, specialization } = req.body;
    try {

        const tutorRepo = AppDataSource.getRepository('Tutor')
        const tutor = await tutorRepo.findOne({ where: { id: req.params.id } })

        if (!tutor) return next(new ErrorHandler('Tutor not found', 404))

        tutor.fullName = fullName;
        tutor.email = email;
        tutor.phoneNumber = phoneNumber;
        tutor.password = password;
        tutor.biography = biography;
        tutor.specialization = specialization;

        const updatedTutor = await tutorRepo.save(tutor)

        return res.status(200).json({
            success: true,
            message: 'Tutor profile updated successfully',
            tutor: updatedTutor
        })
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}

export const deleteTutorProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tutorRepo = AppDataSource.getRepository('Tutor')
        const tutor = await tutorRepo.findOne({ where: { id: req.params.id }, relations: ['courses'] });

        if (!tutor) return next(new ErrorHandler('Tutor not found', 404))

        await tutorRepo.delete(tutor.id)

        return res.status(200).json({
            success: true,
            message: 'Tutor profile deleted successfully'
        })
    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }

}
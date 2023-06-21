import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../util/ErrorHandler";
import { AppDataSource } from "..";
import { Tutor } from "../entities/Tutor";
import { Course } from "../entities/Course";
import { User } from "../entities/User";



export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, rating, price, discount } = req.body;

    try {
        const tutor = await req.body.tutor;
        const courseRepository = AppDataSource.getRepository(Course);
        const course = new Course();

        course.name = name;
        course.description = description;
        course.discount = discount;
        course.tutor = tutor;
        course.rating = rating;
        course.price = price;

        const savedCourse = await courseRepository.save(course);


        res.json({
            success: true,
            message: "Course created successfully",
            data: savedCourse,
        })


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}

export const enrolledCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {courseId}=req.body;

        const userRepository=AppDataSource.getRepository(User);
        const courseRepository=AppDataSource.getRepository(Course);

        const user=await userRepository.findOne({
            where:{
                id:req.body.user.id
            },
            relations:['coursesEnrolled']
        });
        const course=await courseRepository.findOne({
            where:{
                id:courseId
            }
        })

        if(!user || !course) return next(new ErrorHandler("User And Course Not Found",400));

        user.coursesEnrolled.forEach(course=>{
            if(course.id===courseId){
                return next(new ErrorHandler("Course Already Enrolled",400));
            }
        })

        user.coursesEnrolled.push(course);

        const enrolledCourse=await userRepository.save(user);

        res.json({
            success:true,
            message:"Course Enrolled Successfully!",
            course:enrolledCourse
        })


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseRepository = AppDataSource.getRepository(Course);

        const courses = await courseRepository.find({ relations: ['enrolledStudents', 'tutor'] })

        res.json({
            success: true,
            data: courses,
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}


export const getAllCourseByTutor=async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const {id}=await req.body.tutor;
        const tutorRepo=AppDataSource.getRepository(Tutor);

        const tutor=await tutorRepo.findOne({
            where:{
                id:id
            },
            relations:['courses']
        });

        if(!tutor) return next(new ErrorHandler("User Not Found",400));

        return res.json({
            success:true,
            courses:tutor.courses,
        })
    }
    catch (e:any) {
        return next(new ErrorHandler(e.message,404))
    }
}
import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../util/ErrorHandler";
import { AppDataSource } from "..";
import { Tutor } from "../entities/Tutor";
import { Course } from "../entities/Course";
import { User } from "../entities/User";
import { Like } from "typeorm";



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


export const requestToJoinCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.body;
        const { id } = req.body.user;
        const userRepo = AppDataSource.getRepository(User);
        const courseRepo = AppDataSource.getRepository(Course);

        const user = await userRepo.findOne({
            where: {
                id: id
            },
            relations: ['requestedCourses']
        })
        const course = await courseRepo.findOne({
            where: {
                id: courseId
            }
        })

        if (!user) return next(new ErrorHandler("User Not Found", 400));
        if (!course) return next(new ErrorHandler("Course Not Found", 400));

        user.requestedCourses.push(course);

        const courseRequest = await userRepo.save(user);

        res.json({
            success: true,
            message: "Requested Successfully Sent",
            request: courseRequest
        })
    }
    catch (e: any) {
        return next(new ErrorHandler(e.message, 404))
    }
}

export const enrolledCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = await req.body.tutor;
        const { courseId, userId } = req.body;

        const userRepository = AppDataSource.getRepository(User);
        const courseRepository = AppDataSource.getRepository(Course);
        const tutorRep = AppDataSource.getRepository(Tutor);

        const user = await userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['coursesEnrolled', 'requestedCourses']
        });
        const course = await courseRepository.findOne({
            where: {
                id: courseId
            },
            relations: ['tutor']
        })
        const tutor = await tutorRep.findOne({
            where: {
                id: id
            },
            relations: ['courses']
        })

        if (!user || !course || !tutor) return next(new ErrorHandler("User And Course Not Found", 400));

        const includeCourseToTutor = tutor.courses.some(c => c.id === course.id);

        if (!includeCourseToTutor) return next(new ErrorHandler('You Are Not Able to Accept Request', 401));


        user.coursesEnrolled.forEach(course => {
            if (course.id === courseId) {
                return next(new ErrorHandler("Course Already Enrolled", 400));
            }
        })

        const newRequestedCourses = user.requestedCourses.filter(course => course.id !== courseId);

        user.coursesEnrolled.push(course);
        user.requestedCourses = newRequestedCourses;

        const enrolledCourse = await userRepository.save(user);

        res.json({
            success: true,
            message: "Course Enrolled Successfully!",
            course: enrolledCourse
        })


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseRepository = AppDataSource.getRepository(Course);

        const courses = await courseRepository.find({ relations: ['enrolledStudents', 'tutor', 'requestedStudent'] })

        res.json({
            success: true,
            data: courses,
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}


export const getAllCourseByTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = await req.body.tutor;
        const tutorRepo = AppDataSource.getRepository(Tutor);

        const tutor = await tutorRepo.findOne({
            where: {
                id: id
            },
            relations: ['courses']
        });

        if (!tutor) return next(new ErrorHandler("User Not Found", 400));

        return res.json({
            success: true,
            courses: tutor.courses,
        })
    }
    catch (e: any) {
        return next(new ErrorHandler(e.message, 404))
    }
}

export const getAllEnrolledCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = await req.body.user;
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: {
                id: id
            },
            relations: ['coursesEnrolled']
        })

        if (!user) return next(new ErrorHandler("User Not Found", 400));
        return res.json({
            success: true,
            courses: user.coursesEnrolled,
        })
    }
    catch (e: any) {
        return next(new ErrorHandler(e.message, 404))
    }
}


export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;
        const courseRepository = AppDataSource.getRepository(Course);
        const course = await courseRepository.findOne({
            where: {
                id: parseInt(courseId)
            },
            relations: ['tutor', 'enrolledStudents', 'requestedStudent']
        });

        if (!course) {
            return next(new ErrorHandler("Course Not Found", 400));
        }

        const userRepository = AppDataSource.getRepository(User);

        const tutorRepository = AppDataSource.getRepository(Tutor);

        const tutor = await tutorRepository.findOne({
            where: {
                id: course.tutor.id
            },
            relations: ['courses']
        })

        if (!tutor) {
            return next(new ErrorHandler("Tutor Not Found", 400));
        }

        tutor.courses = tutor.courses.filter(c => c.id !== course.id);
        await tutorRepository.save(tutor);

        const user = await userRepository.find({
            where: {
                id: course.tutor.id
            },
            relations: ['coursesEnrolled', 'requestedCourses']
        })

        user.forEach(u => {
            u.coursesEnrolled = u.coursesEnrolled.filter(c => c.id !== course.id);
            u.requestedCourses = u.requestedCourses.filter(c => c.id !== course.id);
            return u
        });

        await userRepository.save(user);

        await courseRepository.remove(course);

        return res.json({
            success: true,
            message: "Course Deleted Successfully"
        })

    } catch (e: any) {
        return next(new ErrorHandler(e.message, 404));
    }
};





export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = await req.body.tutor;
        const { courseId } = req.params;
        const { name, description, rating, price, discount } = req.body;
        const courseRepository = AppDataSource.getRepository(Course);
        const course = await courseRepository.findOne({
            where: {
                id: parseInt(courseId)
            },
            relations: ['tutor']
        })
        if (!course) return next(new ErrorHandler("Course Not Found", 400));

        if (course.tutor.id !== id) return next(new ErrorHandler("You Are Not Able to Update Course", 401));

        course.name = name;
        course.description = description;
        course.rating = rating;
        course.price = price;
        course.discount = discount;
        await courseRepository.save(course);
        return res.json({
            success: true,
            message: "Course Updated Successfully"
        })
    }
    catch (e: any) {
        return next(new ErrorHandler(e.message, 404))
    }
}


export const searchCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.query;
        const courseRepository = AppDataSource.getRepository(Course);
        console.log(name)
        // const courses = await courseRepository.createQueryBuilder("course").where("course.name like :name", { name: `%${name}%` }).getMany()

        const courses = await courseRepository.find({
            where: {
                name: Like(`%${name}%`)
            },
            relations: ['tutor', 'enrolledStudents']
        })

        return res.json({
            success: true,
            courses: courses
        })
    }
    catch (e: any) {
        return next(new ErrorHandler(e.message, 404))
    }
}


export const totalCoursesOfTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = await req.body.tutor;
        const tutorRepo = AppDataSource.getRepository(Tutor);
        const tutor = await tutorRepo.findOne({
            where: {
                id: id
            },
            relations: ['courses']
        });
        if (!tutor) return next(new ErrorHandler("User Not Found", 400));
        return res.json({
            success: true,
            courses: tutor.courses.length
        })
    }
    catch (e: any) {
        return next(new ErrorHandler(e.message, 404))
    }
}

export const enrolledStudentToCoursesByTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = await req.body.tutor;
        const courseRepo = AppDataSource.getRepository(Course);
        const courses = await courseRepo.find({
            relations: ['tutor', 'enrolledStudents'],
        })

        let enrolledStudentTotal = 0;

        courses.forEach(course => {
            if (course.tutor.id === id) {
                enrolledStudentTotal += course.enrolledStudents.length;
            }
        })

        return res.json({
            success: true,
            enrolledStudentTotal
        })
    }
    catch (e: any) {
        return next(new ErrorHandler(e.message, 404))
    }
}

export const totalJoinedCoursesAndRequestedCourses = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = await req.body.user;
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: {
                id: id
            },
            relations: ['coursesEnrolled', 'requestedCourses']
        });

        const joinedCourses = user?.coursesEnrolled?.length;
        const requestedCourses = user?.requestedCourses?.length;

        return res.json({
            success: true,
            joinedCourses,
            requestedCourses
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
}



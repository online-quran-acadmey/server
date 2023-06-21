import { Router } from "express";
import {createCourse, enrolledCourse, getAllCourseByTutor, getAllCourses} from "../services/course.service";
import { tutorAuthMiddleware } from "../middleware/tutorAuth.middleware";
import { userAuthMiddleware } from "../middleware/userAuth.middleware";

const router = Router();

router.post('/create', tutorAuthMiddleware, createCourse);

router.post('/enrolled', userAuthMiddleware, enrolledCourse);

router.get('/all', getAllCourses);

router.get('/getAllByTutor',tutorAuthMiddleware,getAllCourseByTutor);


export default router;
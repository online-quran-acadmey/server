import { Router } from "express";
import {
    createCourse, deleteCourse,
    enrolledCourse,
    getAllCourseByTutor,
    getAllCourses, getAllEnrolledCourses,
    requestToJoinCourse, updateCourse
} from "../services/course.service";
import { tutorAuthMiddleware } from "../middleware/tutorAuth.middleware";
import { userAuthMiddleware } from "../middleware/userAuth.middleware";

const router = Router();

router.post('/create', tutorAuthMiddleware, createCourse);

router.post('/request',userAuthMiddleware,requestToJoinCourse);

router.post('/enrolled', tutorAuthMiddleware, enrolledCourse);

router.get('/all', getAllCourses);



router.get('/getAllByTutor',tutorAuthMiddleware,getAllCourseByTutor);

router.get('/enrolledCourses',userAuthMiddleware,getAllEnrolledCourses);

router.put('/update/:courseId',tutorAuthMiddleware,updateCourse);

router.delete('/delete/:courseId',tutorAuthMiddleware,deleteCourse);

export default router;
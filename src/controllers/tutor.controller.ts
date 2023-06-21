import { Router } from "express";
import { createTutor, getTutorProfile, tutorLogin, updateTutorProfile } from "../services/tutor.service";
import { tutorAuthMiddleware } from "../middleware/tutorAuth.middleware";

const router = Router();


router.post('/create', createTutor);

router.post('/login', tutorLogin);

router.get('/:id', tutorAuthMiddleware, getTutorProfile);

router.put('/update/:id', tutorAuthMiddleware, updateTutorProfile)


export default router
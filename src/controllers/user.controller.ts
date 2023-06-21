import { Router } from "express";
import { createUser, deleteUser, login, updateUser, viewUser } from "../services/user.service";

const router = Router();

router.post('/create', createUser);

router.post('/login', login);

router.get("/view", viewUser);

router.put("/update", updateUser);

router.delete("/delete/:id", deleteUser);


export default router;
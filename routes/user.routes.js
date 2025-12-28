import { Router } from "express";
import { signIn, signUp } from "../controllers/user.controller.js";

const router = Router();

router.post('/signup', signUp); 
router.post('/sign-in', signIn);

export default router;
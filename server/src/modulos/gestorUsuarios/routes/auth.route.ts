import { Router } from "express";

import validate from "../../../middlewares/validate";
import { authLogin } from "../controllers/auth/login";
import { authRegister } from "../controllers/auth/register";
import { loginSchema, registerSchema } from "../validate/auth.validate";
import { auth } from "../../../middlewares/auth";
import { getMe } from "../controllers/auth/getMe";

const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), authRegister);
// authRoutes.post("/register", authRegister);
authRoutes.post("/login", validate(loginSchema), authLogin);
authRoutes.get("/me", auth("me"), getMe);

export default authRoutes;

import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import validate from "../../../middlewares/validate";
import { getAllUsers, getUser } from "../controllers/user/getUser";
import { getUserSchema } from "../validate/user.validate";

const userRoutes = Router();

userRoutes.get("/:userId", auth("getUsers"), validate(getUserSchema), getUser);

userRoutes.get("/", auth("manageUsers"), getAllUsers);

export default userRoutes;

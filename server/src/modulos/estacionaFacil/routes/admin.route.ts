import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { getDashboardData } from "../controllers/admin/dashboard";
import { listarTodasPermissoes } from "../controllers/admin/listarPermissoes";

const router = Router();

router.get("/dashboard", auth("getUsers"), getDashboardData);
router.get("/permissoes", auth("getUsers"), listarTodasPermissoes);

export default router;

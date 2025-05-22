import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { getDashboardData } from "../controllers/admin/dashboard";
import { listarTodasPermissoes } from "../controllers/admin/listarPermissoes";
import { getPermissoesPorHorario } from "../controllers/admin/permissoesPorHorario";

const router = Router();

router.get("/dashboard", auth("getUsers"), getDashboardData);
router.get("/permissoes", auth("getUsers"), listarTodasPermissoes);
router.get("/permissoes/horario", auth("getUsers"), getPermissoesPorHorario);

export default router;

import { Router } from "express";
import { checkPermissao } from "../controllers/permissao/check";
import { registerInfraction } from "../controllers/fiscal/registerInfraction";
import { authMiddleware } from "@/middleware/auth";
import { checkRole } from "@/middleware/checkRole";

const router = Router();

// Rota para verificar permissão
router.post(
  "/permissao/check",
  authMiddleware,
  checkRole(["FISCAL", "ADMIN"]),
  checkPermissao
);

// Rota para registrar infração
router.post(
  "/infraction/register",
  authMiddleware,
  checkRole(["FISCAL", "ADMIN"]),
  registerInfraction
);

export default router;

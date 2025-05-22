import { Router } from "express";
import validate from "../../../middlewares/validate";
import { checkPermissao } from "../controllers/permissao/check";
import { checkPermissaoSchema } from "../validate/permissao.validate";
import { auth } from "../../../middlewares/auth";

const permissaoRoutes = Router();

permissaoRoutes.post(
  "/check",
  auth("checkPermissao"),
  validate(checkPermissaoSchema),
  checkPermissao
);

export default permissaoRoutes;

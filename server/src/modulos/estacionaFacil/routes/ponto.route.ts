import { Router } from "express";

import validate from "../../../middlewares/validate";
import { criarPonto } from "../controllers/ponto/criar";
import { pontoSchema } from "../validate/ponto/ponto.validate";

const pontoRoutes = Router();

pontoRoutes.post("/ponto/criar", validate(pontoSchema), criarPonto);

export default pontoRoutes;

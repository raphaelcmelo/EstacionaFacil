import { Router } from "express";

import validate from "../../../middlewares/validate";
import { criarVeiculo } from "../controllers/veiculo/criar";
import { veiculoSchema } from "../validate/veiculos/veiculos.validate";
import { auth } from "../../../middlewares/auth";
import { listarVeiculo } from "../controllers/veiculo/listar";

const veiculoRoutes = Router();

veiculoRoutes.post("/criar", auth(), validate(veiculoSchema), criarVeiculo);
veiculoRoutes.get("/listar", auth(), listarVeiculo);

export default veiculoRoutes;

import { Router } from "express";

import validate from "../../../middlewares/validate";
import { criarVeiculo } from "../controllers/veiculo/criar";
import { veiculoSchema } from "../validate/veiculos/veiculos.validate";
import { auth } from "../../../middlewares/auth";

const veiculoRoutes = Router();

veiculoRoutes.post("/criar", auth(), validate(veiculoSchema), criarVeiculo);

export default veiculoRoutes;

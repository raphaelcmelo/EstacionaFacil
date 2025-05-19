import { Router } from "express";

import validate from "../../../middlewares/validate";
import { criarVeiculo } from "../controllers/veiculo/criar";
import { veiculoSchema } from "../validate/veiculos/veiculos.validate";
import { auth } from "../../../middlewares/auth";
import { listarVeiculo } from "../controllers/veiculo/listar";
import { editarVeiculo } from "../controllers/veiculo/editar";
import { deletarVeiculo } from "../controllers/veiculo/deletar";

const veiculoRoutes = Router();

veiculoRoutes.post("/criar", auth(), validate(veiculoSchema), criarVeiculo);
veiculoRoutes.get("/listar", auth(), listarVeiculo);
veiculoRoutes.put(
  "/editar/:id",
  auth(),
  validate(veiculoSchema),
  editarVeiculo
);
veiculoRoutes.delete("/deletar/:id", auth(), deletarVeiculo);

export default veiculoRoutes;

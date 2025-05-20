import { Router } from "express";
import validate from "../../../middlewares/validate";
import { criarPreco } from "../controllers/preco/criar";
import { precoSchema } from "../validate/precos/precos.validate";
import { auth } from "../../../middlewares/auth";
import { listarPrecos } from "../controllers/preco/listar";
import { editarPreco } from "../controllers/preco/editar";
import { deletarPreco } from "../controllers/preco/deletar";

const precoRoutes = Router();

// Rota pública para listar preços
precoRoutes.get("/", (req, res, next) => {
  listarPrecos(req, res).catch(next);
});

// Rotas que requerem autenticação
precoRoutes.post("/criar", auth(), validate(precoSchema), (req, res, next) => {
  criarPreco(req, res).catch(next);
});

precoRoutes.patch("/:id", auth(), validate(precoSchema), (req, res, next) => {
  editarPreco(req, res).catch(next);
});

precoRoutes.delete("/:id", auth(), (req, res, next) => {
  deletarPreco(req, res).catch(next);
});

export default precoRoutes;

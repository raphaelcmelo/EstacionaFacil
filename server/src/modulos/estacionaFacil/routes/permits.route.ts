import { Router } from "express";
import validate from "../../../middlewares/validate";
import { criarPermit } from "../controllers/permit/criar";
import { verificarPermit } from "../controllers/permit/verificar";
import { listarPermissoesAtivas } from "../controllers/permit/listarAtivas";
// IMPORTAR O NOVO CONTROLLER PARA HISTÓRICO QUANDO CRIADO
// import { listarHistoricoPermissoes } from "../controllers/permit/listarHistorico";

// Schemas de validação de 'permit' (usuário)
import {
  quickBuySchema,
  checkPermitSchema as userCheckPermitSchema,
} from "../validate/permit.validate";
import { auth } from "../../../middlewares/auth";

// Controladores e Schemas do antigo 'permissao.route.ts' (contexto de fiscalização/admin)
import { checkPermissao as checkPermissaoFiscal } from "../controllers/permissao/check";
import { checkPermissaoSchema as fiscalCheckPermissaoSchema } from "../validate/permissao.validate";

const permitsRouter = Router();

// --- Rotas para o Usuário ---
// Comprar permissão (pode ser logado ou não logado)
permitsRouter.post(
  "/quick-buy",
  // O middleware 'auth' foi removido daqui.
  // O controller 'criarPermit' deve verificar se req.user existe
  // para associar ao usuário, ou criar anonimamente.
  validate(quickBuySchema),
  criarPermit
);

// Verificar status de uma permissão (pelo usuário) - requer autenticação
permitsRouter.post(
  "/user-check", // Path diferenciado do check de fiscal
  auth, // Requer autenticação
  validate(userCheckPermitSchema),
  verificarPermit
);

// Listar permissões ativas do usuário - requer autenticação
permitsRouter.get("/ativas", auth, listarPermissoesAtivas);

// Listar histórico de permissões do usuário (NOVA ROTA) - requer autenticação
permitsRouter.get(
  "/historico",
  auth,
  // TODO: Implementar o controller listarHistoricoPermissoes
  // Este controller receberá 'limit' e 'offset' de req.query.
  (req, res) => {
    res
      .status(501)
      .json({
        message: "Endpoint de histórico a ser implementado.",
        query: req.query,
      });
  }
  // Substitua o handler acima pelo seu controller: listarHistoricoPermissoes
);

// --- Rotas para Fiscalização/Admin ---
// Verificar permissão (contexto de fiscalização) - requer autenticação específica
permitsRouter.post(
  "/fiscal-check", // Path diferenciado
  auth("checkPermissao"), // 'auth' com parâmetro de permissão específica
  validate(fiscalCheckPermissaoSchema),
  checkPermissaoFiscal
);

export default permitsRouter;

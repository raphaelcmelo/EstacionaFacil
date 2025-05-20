import { Router } from "express";
import validate from "../../../middlewares/validate";
import { criarPermit } from "../controllers/permit/criar";
import { verificarPermit } from "../controllers/permit/verificar";
import { listarPermissoesAtivas } from "../controllers/permit/listarAtivas";
import { quickBuySchema, checkPermitSchema } from "../validate/permit.validate";
import { auth } from "../../../middlewares/auth";

const router = Router();

router.post("/quick-buy", validate(quickBuySchema), criarPermit);
router.post("/check", validate(checkPermitSchema), verificarPermit);
router.get("/ativas", auth, listarPermissoesAtivas);

export default router;

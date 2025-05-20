import { Router } from "express";
import validate from "../../../middlewares/validate";
import { criarPermit } from "../controllers/permit/criar";
import { verificarPermit } from "../controllers/permit/verificar";
import { quickBuySchema, checkPermitSchema } from "../validate/permit.validate";

const router = Router();

router.post("/quick-buy", validate(quickBuySchema), criarPermit);
router.post("/check", validate(checkPermitSchema), verificarPermit);

export default router;

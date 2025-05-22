import { Router } from "express";
import { checkPermission } from "../controllers/permissionController";
import { checkPermissionSchema } from "../schemas/permission";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.post("/check", validateRequest(checkPermissionSchema), checkPermission);

export default router;

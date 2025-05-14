import { Router } from "express";
import { infoStatus } from "../../modulos/statusApi/info";

const statusRoutes = Router();

statusRoutes.get("/", infoStatus);

export default statusRoutes;

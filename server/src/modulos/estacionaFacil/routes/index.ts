import { Router } from "express";
import pontoRoutes from "./ponto.route";

const estacionaFacilRoutes = Router();

const defaultRoutes = [
  {
    path: "/register",
    route: pontoRoutes,
  },
];

defaultRoutes.forEach((route) => {
  estacionaFacilRoutes.use(route.path, route.route);
});

export default estacionaFacilRoutes;

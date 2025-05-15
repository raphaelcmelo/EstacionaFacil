import { Router } from "express";
import veiculoRoutes from "./veiculo.route";

const estacionaFacilRoutes = Router();

const defaultRoutes = [
  {
    path: "/veiculo",
    route: veiculoRoutes,
  },
];

defaultRoutes.forEach((route) => {
  estacionaFacilRoutes.use(route.path, route.route);
});

export default estacionaFacilRoutes;

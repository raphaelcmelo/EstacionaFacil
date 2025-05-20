import { Router } from "express";
import veiculoRoutes from "./veiculo.route";
import precoRoutes from "./preco.route";

const estacionaFacilRoutes = Router();

const defaultRoutes = [
  {
    path: "/veiculo",
    route: veiculoRoutes,
  },
  {
    path: "/precos",
    route: precoRoutes,
  },
];

defaultRoutes.forEach((route) => {
  estacionaFacilRoutes.use(route.path, route.route);
});

export default estacionaFacilRoutes;

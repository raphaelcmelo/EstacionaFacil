import { Router } from "express";
import veiculoRoutes from "./veiculo.route";
import precoRoutes from "./preco.route";
import permitsRoutes from "./permits.route";
import adminRoutes from "./admin.route";
import permissaoRoutes from "./permissao.route";

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
  {
    path: "/permits",
    route: permitsRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/permissao",
    route: permissaoRoutes,
  },
];

defaultRoutes.forEach((route) => {
  estacionaFacilRoutes.use(route.path, route.route);
});

export default estacionaFacilRoutes;

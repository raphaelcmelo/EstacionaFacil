import { Router } from "express";

import gestorUsuarios from "../../modulos/gestorUsuarios/routes";
import statusRoutes from "./status.route";
import estacionaFacilRoutes from "../../modulos/estacionaFacil/routes";

const routes = Router();

const defaultRoutes = [
  {
    path: "/",
    route: statusRoutes,
  },
  {
    path: "/gestor-usuarios",
    route: gestorUsuarios,
  },
  {
    path: "/estaciona-facil",
    route: estacionaFacilRoutes,
  },
];

const devRoutes = [
  //   // routes available only in development mode
  //   {
  //     path: '/docs',
  //     route: docsRoute,
  //   },
];

defaultRoutes.forEach((route) => {
  routes.use(route.path, route.route);
});

/* istanbul ignore next */
// if (env.NODE_ENV === "dev") {
//   devRoutes.forEach((route) => {
//     routes.use(route.path, route.route);
//   });
// }

export default routes;

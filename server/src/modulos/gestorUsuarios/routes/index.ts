import { Router } from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";

const gestorUsuarios = Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
];

defaultRoutes.forEach((route) => {
  gestorUsuarios.use(route.path, route.route);
});

export default gestorUsuarios;

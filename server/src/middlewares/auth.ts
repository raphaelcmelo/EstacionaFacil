import { NextFunction, Request, Response } from "express";
import status from "http-status";
import passport from "passport";
import { roleRights } from "../config/roles";
import { User } from "../modulos/gestorUsuarios/repositories/models/user.model";
import ApiError from "../utils/ApiError";

const verifyCallback =
  (req: Request, resolve: any, reject: any, requiredRights: any) =>
  async (err: Error | null, user: User, info: any) => {
    if (err || info || !user) {
      return reject(new ApiError(status.UNAUTHORIZED, "Please authenticate"));
    }
    req.user = user;

    if (requiredRights && requiredRights.length) {
      const userRights = roleRights.get(user.role);

      if (!userRights) {
        return reject(
          new ApiError(status.FORBIDDEN, "Role não possui permissões definidas")
        );
      }

      const hasRequiredRights = requiredRights.every((requiredRight: any) =>
        userRights.includes(requiredRight)
      );

      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(status.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };

export const auth =
  (...requiredRights: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

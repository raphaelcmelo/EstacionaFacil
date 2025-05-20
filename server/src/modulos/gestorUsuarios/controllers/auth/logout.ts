import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../../utils/catchAsync";
import { MongoTokenRepository } from "../../repositories/mongodb/mongo.token.repository";
import { LogoutUseCase } from "../../use-cases/auth/logout";
import { User } from "../../repositories/models/user.model";

const tokenRepository = new MongoTokenRepository();
const logoutUseCase = new LogoutUseCase(tokenRepository);

export const authLogout = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new Error("Usuário não autenticado");
    }
    const user = req.user as User;
    await logoutUseCase.execute(user.id);
    res.status(status.OK).send({ message: "Logout realizado com sucesso" });
  }
);

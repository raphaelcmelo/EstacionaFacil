import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { MongoTokenRepository } from "../../repositories/mongodb/mongo.token.repository";
import { MongoUserRepository } from "../../repositories/mongodb/mongo.user.repository";
import { LoginWithCpfAndPassword } from "../../use-cases/auth/loginWithCpfAndPassword";
import { GenerateAuthTokensUseCase } from "../../use-cases/token/generateAuthTokens";

const userRepository = new MongoUserRepository();
const loginWithCpfAndPassword = new LoginWithCpfAndPassword(userRepository);

const tokenRepository = new MongoTokenRepository();
const generateAuthTokensUseCase = new GenerateAuthTokensUseCase(
  tokenRepository
);

export const authLogin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { cpf, password } = req.body;

    const user = await loginWithCpfAndPassword.execute(cpf, password);

    const tokens = await generateAuthTokensUseCase.execute(user);
    res.status(status.OK).send({ user, tokens });
  }
);

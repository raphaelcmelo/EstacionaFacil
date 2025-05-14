import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../../../utils/catchAsync";
import { MongoTokenRepository } from "../../repositories/mongodb/mongo.token.repository";
import { MongoUserRepository } from "../../repositories/mongodb/mongo.user.repository";
import { GenerateAuthTokensUseCase } from "../../use-cases/token/generateAuthTokens";
import { CreateUserUseCase } from "../../use-cases/user/createUser";

const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);

const tokenRepository = new MongoTokenRepository();
const generateAuthTokensUseCase = new GenerateAuthTokensUseCase(
  tokenRepository
);

export const authRegister = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await createUserUseCase.execute(req.body);
    const tokens = await generateAuthTokensUseCase.execute(user);
    res.status(status.CREATED).send({ user, tokens });
  }
);

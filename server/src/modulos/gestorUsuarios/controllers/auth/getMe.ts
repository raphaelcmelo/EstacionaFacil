import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { MongoTokenRepository } from "../../repositories/mongodb/mongo.token.repository";
import { MongoUserRepository } from "../../repositories/mongodb/mongo.user.repository";
import { LoginWithCpfAndPassword } from "../../use-cases/auth/loginWithCpfAndPassword";
import { GenerateAuthTokensUseCase } from "../../use-cases/token/generateAuthTokens";
import { GetMeUseCase } from "../../use-cases/user/getMe";

const userRepository = new MongoUserRepository();
const getMeUseCase = new GetMeUseCase(userRepository);

export const getMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    // const userId = req?.user?._id.toString();
    // const user = await getMeUseCase.execute(userId);
    res.status(status.OK).send(req.user);
  }
);

import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { MongoUserRepository } from "../../repositories/mongodb/mongo.user.repository";
import { GetUserUseCase } from "../../use-cases/user/getUser";

const userRepository = new MongoUserRepository();
const getUserUseCase = new GetUserUseCase(userRepository);

export const getUser = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await getUserUseCase.execute(req.params.userId);
    res.status(status.OK).send(user);
  }
);

export const getAllUsers = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const users = await userRepository.findAll();
    res.status(status.OK).send(users);
  }
);

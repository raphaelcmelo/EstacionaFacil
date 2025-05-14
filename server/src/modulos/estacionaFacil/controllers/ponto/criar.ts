import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { MongoPontoRepository } from "../../repositories/mongodb/mongo.ponto.repository";
import { CriarPontoUseCase } from "../../useCases/ponto/criarPonto.useCase";

const pontoRepository = new MongoPontoRepository();
const criarPontoUseCase = new CriarPontoUseCase(pontoRepository);

export const criarPonto = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = {
      id: "6637b21c9c5f8b4fdb4a4f32",
    };
    console.log(req.user);
    const ponto = await criarPontoUseCase.execute(req.body, user);
    res.status(status.CREATED).send(ponto);
  }
);

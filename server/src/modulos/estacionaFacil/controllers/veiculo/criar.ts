import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { CriarVeiculoUseCase } from "../../useCases/veiculos/criarVeiculo.useCase";
import { MongoVeiculoRepository } from "../../repositories/mongodb/mongo.veiculo.repository";

const veiculoRepository = new MongoVeiculoRepository();
const criarVeiculoUseCase = new CriarVeiculoUseCase(veiculoRepository);

export const criarVeiculo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const veiculo = await criarVeiculoUseCase.execute(req.body, req?.user?.id);
    res.status(status.CREATED).send(veiculo);
  }
);

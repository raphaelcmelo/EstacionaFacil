import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { MongoVeiculoRepository } from "../../repositories/mongodb/mongo.veiculo.repository";
import { User } from "../../../gestorUsuarios/repositories/models/user.model";
import { ListarVeiculoUseCase } from "../../useCases/veiculos/listarVeiculo.useCase";

const veiculoRepository = new MongoVeiculoRepository();
const listarVeiculoUseCase = new ListarVeiculoUseCase(veiculoRepository);

export const listarVeiculo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new Error("Usuário não autenticado");
    }
    const user = req.user as User;
    const veiculo = await listarVeiculoUseCase.execute(user.id);
    res.status(200).send(veiculo);
  }
);

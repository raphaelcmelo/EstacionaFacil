import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { EditarVeiculoUseCase } from "../../useCases/veiculos/editarVeiculo.useCase";
import { MongoVeiculoRepository } from "../../repositories/mongodb/mongo.veiculo.repository";
import { User } from "../../../gestorUsuarios/repositories/models/user.model";

const veiculoRepository = new MongoVeiculoRepository();
const editarVeiculoUseCase = new EditarVeiculoUseCase(veiculoRepository);

export const editarVeiculo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new Error("Usuário não autenticado");
    }
    const user = req.user as User;
    const { id } = req.params;
    const veiculo = await editarVeiculoUseCase.execute(id, req.body, user.id);
    res.status(status.OK).send(veiculo);
  }
);

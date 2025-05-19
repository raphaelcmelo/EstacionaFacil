import { Request, Response } from "express";
import status from "http-status";

import { catchAsync } from "../../../../utils/catchAsync";
import { MongoVeiculoRepository } from "../../repositories/mongodb/mongo.veiculo.repository";
import { User } from "../../../gestorUsuarios/repositories/models/user.model";
import { DeletarVeiculoUseCase } from "../../useCases/veiculos/deletarVeiculo.useCase";

const veiculoRepository = new MongoVeiculoRepository();
const deletarVeiculoUseCase = new DeletarVeiculoUseCase(veiculoRepository);

export const deletarVeiculo = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new Error("Usuário não autenticado");
    }
    const user = req.user as User;
    const { id } = req.params;
    await deletarVeiculoUseCase.execute(id, user.id);
    res.status(status.OK).send({ message: "Veículo deletado com sucesso" });
  }
);

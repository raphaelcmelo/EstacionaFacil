import { Veiculo, VeiculoModel } from "../model/veiculo.model";
import { VeiculoInput, VeiculoRepository } from "../ports/veiculo.repository";

export class MongoVeiculoRepository implements VeiculoRepository {
  async create(
    { placa, modelo }: VeiculoInput,
    userId: string
  ): Promise<Veiculo> {
    const veiculo = await VeiculoModel.create({ userId, placa, modelo });
    return veiculo;
  }
}

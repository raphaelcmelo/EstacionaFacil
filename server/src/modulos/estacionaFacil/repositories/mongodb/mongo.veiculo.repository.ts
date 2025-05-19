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
  async listar(userId: string): Promise<Veiculo[]> {
    const veiculos = await VeiculoModel.find({ userId });
    return veiculos;
  }

  async editar(
    id: string,
    { placa, modelo }: VeiculoInput,
    userId: string
  ): Promise<Veiculo> {
    const veiculo = await VeiculoModel.findOneAndUpdate(
      { _id: id, userId },
      { placa, modelo, updatedAt: new Date() },
      { new: true }
    );

    if (!veiculo) {
      throw new Error("Veículo não encontrado");
    }

    return veiculo;
  }

  async deletar(id: string, userId: string): Promise<Veiculo> {
    const veiculo = await VeiculoModel.findOneAndDelete({ _id: id, userId });
    if (!veiculo) {
      throw new Error("Veículo não encontrado");
    }
    return veiculo;
  }
}

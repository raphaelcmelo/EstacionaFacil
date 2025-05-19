import {
  VeiculoInput,
  VeiculoRepository,
} from "../../repositories/ports/veiculo.repository";

export class ListarVeiculoUseCase {
  constructor(private veiculoRepository: VeiculoRepository) {}

  async execute(userId: string) {
    const veiculo = await this.veiculoRepository.listar(userId);
    return veiculo;
  }
}

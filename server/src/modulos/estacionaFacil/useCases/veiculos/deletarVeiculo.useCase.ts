import { VeiculoRepository } from "../../repositories/ports/veiculo.repository";

export class DeletarVeiculoUseCase {
  constructor(private veiculoRepository: VeiculoRepository) {}

  async execute(id: string, userId: string) {
    const veiculo = await this.veiculoRepository.deletar(id, userId);
    return veiculo;
  }
}

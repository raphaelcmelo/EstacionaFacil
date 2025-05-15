import {
  VeiculoInput,
  VeiculoRepository,
} from "../../repositories/ports/veiculo.repository";

export class CriarVeiculoUseCase {
  constructor(private veiculoRepository: VeiculoRepository) {}

  async execute(veiculoInput: VeiculoInput, userId: string) {
    const veiculo = await this.veiculoRepository.create(veiculoInput, userId);
    return veiculo;
  }
}

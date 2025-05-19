import {
  VeiculoInput,
  VeiculoRepository,
} from "../../repositories/ports/veiculo.repository";

export class EditarVeiculoUseCase {
  constructor(private veiculoRepository: VeiculoRepository) {}

  async execute(id: string, veiculoInput: VeiculoInput, userId: string) {
    const veiculo = await this.veiculoRepository.editar(
      id,
      veiculoInput,
      userId
    );
    return veiculo;
  }
}

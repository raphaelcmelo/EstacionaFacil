import {
  PrecoInput,
  PrecoRepository,
} from "../../repositories/ports/preco.repository";

export class CriarPrecoUseCase {
  constructor(private precoRepository: PrecoRepository) {}

  async execute(data: PrecoInput) {
    const temPeriodoValido = await this.precoRepository.verificarPeriodoValido(
      new Date(data.validFrom),
      data.validTo ? new Date(data.validTo) : null
    );

    if (temPeriodoValido) {
      throw new Error(
        "Já existe uma configuração de preço válida neste período"
      );
    }

    return this.precoRepository.criar(data);
  }
}

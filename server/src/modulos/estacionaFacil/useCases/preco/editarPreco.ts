import { Preco } from "../../validate/precos/precos.validate";
import { PrecoRepository } from "../../repositories/ports/preco.repository";

export class EditarPrecoUseCase {
  constructor(private precoRepository: PrecoRepository) {}

  async execute(id: number, data: Preco) {
    const preco = await this.precoRepository.buscarPorId(id);

    if (!preco) {
      throw new Error("Configuração de preço não encontrada");
    }

    const temPeriodoValido = await this.precoRepository.verificarPeriodoValido(
      new Date(data.validFrom),
      data.validTo ? new Date(data.validTo) : null,
      id
    );

    if (temPeriodoValido) {
      throw new Error(
        "Já existe uma configuração de preço válida neste período"
      );
    }

    return this.precoRepository.editar(id, data);
  }
}

import { PrecoRepository } from "../../repositories/ports/preco.repository";

export class DeletarPrecoUseCase {
  constructor(private precoRepository: PrecoRepository) {}

  async execute(id: number) {
    const preco = await this.precoRepository.buscarPorId(id);

    if (!preco) {
      throw new Error("Configuração de preço não encontrada");
    }

    const isCurrentConfig =
      !preco.valid_to || new Date(preco.valid_to) > new Date();

    if (isCurrentConfig) {
      throw new Error("Não é possível excluir a configuração de preço atual");
    }

    await this.precoRepository.deletar(id);
  }
}

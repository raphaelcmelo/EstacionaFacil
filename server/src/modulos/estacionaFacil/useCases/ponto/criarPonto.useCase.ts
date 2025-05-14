import {
  PontoInput,
  PontoRepository,
} from "../../repositories/ports/ponto.repository";

export class CriarPontoUseCase {
  constructor(private pontoRepository: PontoRepository) {}

  async execute(pontoInput: PontoInput, user: any) {
    console.log(user);
    const userId = user.id;

    const ponto = await this.pontoRepository.create({
      location: pontoInput.location,
      userId,
    });

    return ponto;
  }
}

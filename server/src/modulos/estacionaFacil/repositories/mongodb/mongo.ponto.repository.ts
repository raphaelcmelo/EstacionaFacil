import { PontoInput, PontoRepository } from "../ports/ponto.repository";
import { Ponto, PontoModel } from "../model/ponto.model";

export class MongoPontoRepository implements PontoRepository {
  async create({ userId, location }: PontoInput): Promise<Ponto> {
    const ponto = await PontoModel.create({ userId, location });
    return ponto;
  }
}

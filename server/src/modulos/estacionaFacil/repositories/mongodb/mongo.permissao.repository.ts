import { Permissao, PermissaoModel } from "../model/permissao.model";
import {
  PermissaoInput,
  PermissaoRepository,
} from "../ports/permissao.repository";

export class MongoPermissaoRepository implements PermissaoRepository {
  async criar(data: PermissaoInput): Promise<Permissao> {
    const permissao = await PermissaoModel.create(data);
    return permissao;
  }

  async buscarPermissaoAtiva(
    placa: string,
    checkTime: Date
  ): Promise<Permissao | null> {
    const permissao = await PermissaoModel.findOne({
      placa: placa.toUpperCase(),
      startDate: { $lte: checkTime },
      endDate: { $gte: checkTime },
    });

    return permissao;
  }

  async buscarPorPlaca(placa: string): Promise<Permissao | null> {
    const permissao = await PermissaoModel.findOne({
      placa: placa.toUpperCase(),
    }).sort({ createdAt: -1 });

    return permissao;
  }
}

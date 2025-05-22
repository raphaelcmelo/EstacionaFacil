import { Permissao } from "../model/permissao.model";

export type PermissaoInput = {
  placa: string;
  startDate: Date;
  endDate: Date;
};

export interface PermissaoRepository {
  criar(data: PermissaoInput): Promise<Permissao>;
  buscarPermissaoAtiva(
    placa: string,
    checkTime: Date
  ): Promise<Permissao | null>;
  buscarPorPlaca(placa: string): Promise<Permissao | null>;
}

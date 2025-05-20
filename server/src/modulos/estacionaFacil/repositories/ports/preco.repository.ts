import { Preco } from "../model/preco.model";

export type PrecoInput = {
  validFrom: Date;
  validTo?: Date | null;
  hour1Price: number;
  hour2Price: number;
  hour3Price: number;
  hour4Price: number;
  hour5Price: number;
  hour6Price: number;
  hour12Price: number;
};

export interface PrecoRepository {
  criar(data: PrecoInput): Promise<Preco>;
  listar(): Promise<{ current: Preco | null; history: Preco[] }>;
  editar(id: string, data: PrecoInput): Promise<Preco>;
  deletar(id: string): Promise<Preco>;
  verificarPeriodoValido(
    validFrom: Date,
    validTo: Date | null,
    id?: string
  ): Promise<boolean>;
}

import { ObjectId } from "mongoose";
import { Veiculo } from "../model/veiculo.model";

export type VeiculoInput = {
  placa: string;
  modelo?: string;
};

export interface VeiculoRepository {
  create({ placa, modelo }: VeiculoInput, userId: string): Promise<Veiculo>;
  listar(userId: string): Promise<Veiculo[]>;
  editar(
    id: string,
    { placa, modelo }: VeiculoInput,
    userId: string
  ): Promise<Veiculo>;
  deletar(id: string, userId: string): Promise<Veiculo>;
}

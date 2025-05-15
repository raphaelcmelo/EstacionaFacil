import { ObjectId } from "mongoose";
import { Veiculo } from "../model/veiculo.model";

export type VeiculoInput = {
  placa: string;
  modelo?: string;
};

export interface VeiculoRepository {
  create({ placa, modelo }: VeiculoInput, userId: string): Promise<Veiculo>;
}

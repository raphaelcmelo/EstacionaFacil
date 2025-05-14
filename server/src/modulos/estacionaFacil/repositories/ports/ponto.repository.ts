import { ObjectId } from "mongoose";
import { Ponto } from "../model/ponto.model";

export type PontoInput = {
  userId: string;
  location: {
    coordinates: [];
  };
};

export interface PontoRepository {
  create({ userId, location }: PontoInput): Promise<Ponto>;
}

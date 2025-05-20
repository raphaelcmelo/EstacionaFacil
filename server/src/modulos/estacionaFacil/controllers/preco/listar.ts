import { Request, Response } from "express";
import { MongoPrecoRepository } from "../../repositories/mongodb/mongo.preco.repository";

export const listarPrecos = async (req: Request, res: Response) => {
  try {
    const precoRepository = new MongoPrecoRepository();
    const precos = await precoRepository.listar();

    return res.json(precos);
  } catch (error) {
    console.error("Erro ao listar configurações de preço:", error);
    return res.status(500).json({
      message: "Erro ao listar configurações de preço",
    });
  }
};

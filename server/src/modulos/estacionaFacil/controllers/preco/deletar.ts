import { Request, Response } from "express";
import { MongoPrecoRepository } from "../../repositories/mongodb/mongo.preco.repository";
import mongoose from "mongoose";

export const deletarPreco = async (req: Request, res: Response) => {
  try {
    const precoRepository = new MongoPrecoRepository();
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const preco = await precoRepository.deletar(id);

    return res.json(preco);
  } catch (error) {
    console.error("Erro ao deletar configuração de preço:", error);
    return res.status(500).json({
      message: "Erro ao deletar configuração de preço",
    });
  }
};

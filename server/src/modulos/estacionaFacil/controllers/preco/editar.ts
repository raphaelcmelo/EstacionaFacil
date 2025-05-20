import { Request, Response } from "express";
import { MongoPrecoRepository } from "../../repositories/mongodb/mongo.preco.repository";
import { validatePrecoInput } from "../../validate/preco.validate";
import mongoose from "mongoose";

export const editarPreco = async (req: Request, res: Response) => {
  try {
    const precoRepository = new MongoPrecoRepository();
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const data = validatePrecoInput(req.body);

    const periodoValido = await precoRepository.verificarPeriodoValido(
      data.validFrom,
      data.validTo || null,
      id
    );

    if (periodoValido) {
      return res.status(400).json({
        message: "Já existe uma configuração de preço para este período",
      });
    }

    const preco = await precoRepository.editar(id, data);

    return res.json(preco);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Erro ao editar configuração de preço",
    });
  }
};

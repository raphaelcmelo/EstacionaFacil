import { Request, Response } from "express";
import { MongoPrecoRepository } from "../../repositories/mongodb/mongo.preco.repository";
import { validatePrecoInput } from "../../validate/preco.validate";

export const criarPreco = async (req: Request, res: Response) => {
  try {
    const precoRepository = new MongoPrecoRepository();
    const data = validatePrecoInput(req.body);

    const periodoValido = await precoRepository.verificarPeriodoValido(
      data.validFrom,
      data.validTo || null
    );

    if (periodoValido) {
      return res.status(400).json({
        message: "Já existe uma configuração de preço para este período",
      });
    }

    const preco = await precoRepository.criar(data);

    return res.status(201).json(preco);
  } catch (error) {
    console.error("Erro ao criar configuração de preço:", error);
    return res.status(500).json({
      message: "Erro ao criar configuração de preço",
    });
  }
};

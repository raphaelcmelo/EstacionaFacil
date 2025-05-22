import { Request, Response } from "express";
import { MongoInfractionRepository } from "../../repositories/mongodb/mongo.infraction.repository";
import { toBrasiliaTime } from "@/utils/date";

interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
  };
}

export const registerInfraction = async (req: AuthRequest, res: Response) => {
  try {
    const infractionRepository = new MongoInfractionRepository();
    const { vehicleId, checkTime, location, description, amount } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    const infracao = await infractionRepository.criarInfracao({
      vehicleId,
      fiscalId: req.user.id,
      fiscalName: req.user.name,
      checkTime: new Date(checkTime),
      location,
      description,
      amount,
    });

    const infracaoObj = infracao.toObject();

    return res.status(201).json({
      message: "Infração registrada com sucesso",
      infracao: {
        ...infracaoObj,
        checkTime: toBrasiliaTime(infracaoObj.checkTime).toISOString(),
        createdAt: toBrasiliaTime(infracaoObj.createdAt).toISOString(),
        updatedAt: infracaoObj.updatedAt
          ? toBrasiliaTime(infracaoObj.updatedAt).toISOString()
          : undefined,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar infração:", error);
    return res.status(500).json({
      message: "Erro ao registrar infração",
    });
  }
};

import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";

export const verificarPermit = async (req: Request, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();
    const { licensePlate } = req.body;

    const permit = await permitRepository.buscarPorPlaca(licensePlate);

    if (!permit) {
      return res.json({ found: false });
    }

    const now = new Date();
    const isValid =
      permit.endTime > now && permit.paymentStatus === PaymentStatus.COMPLETED;

    res.json({
      found: true,
      permit: {
        ...permit.toJSON(),
        isValid,
        timeRemaining: permit.endTime.getTime() - now.getTime(),
      },
    });
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    res.status(500).json({
      message: "Erro ao verificar permissão",
    });
  }
};

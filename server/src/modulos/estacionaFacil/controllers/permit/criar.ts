import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";

export const criarPermit = async (req: Request, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();
    const { licensePlate, model, durationHours, paymentMethod } = req.body;

    const now = new Date();
    const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    // Se for método de teste, já marca como pago
    const paymentStatus =
      paymentMethod === "TESTE"
        ? PaymentStatus.COMPLETED
        : PaymentStatus.PENDING;

    const permit = await permitRepository.criar({
      vehicleId: licensePlate,
      durationHours,
      startTime: now,
      endTime,
      amount: 0, // Em produção, calcular o valor baseado na duração
      paymentStatus,
      paymentMethod,
      transactionCode: Math.random().toString(36).substring(7).toUpperCase(),
    });

    return res.status(201).json(permit);
  } catch (error) {
    console.error("Erro ao criar permissão:", error);
    return res.status(500).json({
      message: "Erro ao criar permissão",
    });
  }
};

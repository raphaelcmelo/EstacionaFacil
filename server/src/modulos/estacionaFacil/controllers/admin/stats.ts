import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();

    // Data de hoje e ontem
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    console.log("Data de hoje:", today);
    console.log("Data de ontem:", yesterday);

    // Estatísticas de permissões
    const todayPermits = await permitRepository.buscarPorPeriodo(
      today,
      new Date()
    );
    const yesterdayPermits = await permitRepository.buscarPorPeriodo(
      yesterday,
      today
    );

    console.log("Permissões de hoje:", todayPermits);
    console.log("Permissões de ontem:", yesterdayPermits);

    const todayRevenue = todayPermits.reduce(
      (acc, permit) => acc + permit.amount,
      0
    );
    const yesterdayRevenue = yesterdayPermits.reduce(
      (acc, permit) => acc + permit.amount,
      0
    );

    // Desempenho dos fiscais (mock data por enquanto)
    const fiscalPerformance = [
      {
        fiscalId: "1",
        fiscalName: "João Silva",
        verifications: 45,
        performance: 95,
      },
      {
        fiscalId: "2",
        fiscalName: "Maria Santos",
        verifications: 38,
        performance: 88,
      },
    ];

    const retorno = {
      permitStats: {
        todayCount: todayPermits.length,
        yesterdayCount: yesterdayPermits.length,
        todayRevenue,
        yesterdayRevenue,
      },
      fiscalPerformance,
    };
    console.log("Retorno final de stats:", retorno);
    return res.json(retorno);
  } catch (error) {
    console.error("Erro ao buscar estatísticas administrativas:", error);
    return res.status(500).json({
      message: "Erro ao buscar estatísticas administrativas",
    });
  }
};

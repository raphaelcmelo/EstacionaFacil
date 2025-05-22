import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";
import { UserModel } from "../../../gestorUsuarios/repositories/models/user.model";
import { getBrasiliaDayRange, getCurrentBrasiliaTime } from "@/utils/date";

interface AuthRequest extends Request {
  user?: any;
}

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();

    // Obtém o início e fim do dia em GMT-3
    const { start: inicioDoDia, end: fimDoDia } = getBrasiliaDayRange();

    // Busca permissões do dia
    const permissoesDoDia = await permitRepository.buscarPermissoesPorPeriodo(
      inicioDoDia,
      fimDoDia
    );

    // Calcula a receita total do dia
    const receitaTotal = permissoesDoDia
      .filter(
        (permissao) => permissao.paymentStatus === PaymentStatus.COMPLETED
      )
      .reduce((total, permissao) => total + permissao.amount, 0);

    // Conta infrações do dia (permissões expiradas)
    const now = getCurrentBrasiliaTime();
    const infracoesDoDia = permissoesDoDia.filter(
      (permissao) =>
        permissao.endTime < now &&
        permissao.paymentStatus === PaymentStatus.COMPLETED
    ).length;

    // Conta usuários com perfil CITIZEN
    const totalUsuariosCidadao = await UserModel.countDocuments({
      role: "CITIZEN",
    });

    return res.json({
      permissoesHoje: permissoesDoDia.length,
      receitaTotalHoje: receitaTotal,
      infracoesHoje: infracoesDoDia,
      totalUsuariosCidadao,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return res.status(500).json({
      message: "Erro ao buscar dados do dashboard",
    });
  }
};

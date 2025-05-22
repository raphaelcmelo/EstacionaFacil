import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { UserModel } from "../../../gestorUsuarios/repositories/models/user.model";
import { PaymentStatus } from "@shared/schema";

interface AuthRequest extends Request {
  user?: any;
}

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();

    // Obtém a data de hoje (início e fim do dia)
    const hoje = new Date();
    const inicioDoDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );
    const fimDoDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59
    );

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
    const infracoesDoDia = permissoesDoDia.filter(
      (permissao) =>
        permissao.endTime < new Date() &&
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

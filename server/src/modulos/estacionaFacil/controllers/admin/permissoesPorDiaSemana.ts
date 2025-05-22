import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";
import { toBrasiliaTime } from "@/utils/date";

interface DiaSemana {
  dia: string;
  quantidade: number;
}

export const getPermissoesPorDiaSemana = async (
  req: Request,
  res: Response
) => {
  try {
    const permitRepository = new MongoPermitRepository();

    // Busca todas as permissões
    const todasPermissoes = await permitRepository.buscarTodasPermissoes();

    // Inicializa o array de dias da semana
    const diasSemana: DiaSemana[] = [
      { dia: "Domingo", quantidade: 0 },
      { dia: "Segunda", quantidade: 0 },
      { dia: "Terça", quantidade: 0 },
      { dia: "Quarta", quantidade: 0 },
      { dia: "Quinta", quantidade: 0 },
      { dia: "Sexta", quantidade: 0 },
      { dia: "Sábado", quantidade: 0 },
    ];

    // Conta as permissões por dia da semana
    todasPermissoes.forEach((permissao) => {
      if (permissao.paymentStatus === PaymentStatus.COMPLETED) {
        const dataInicio = toBrasiliaTime(permissao.startTime);
        const diaSemana = dataInicio.getDay();
        diasSemana[diaSemana].quantidade++;
      }
    });

    return res.json(diasSemana);
  } catch (error) {
    console.error("Erro ao buscar permissões por dia da semana:", error);
    return res.status(500).json({
      message: "Erro ao buscar permissões por dia da semana",
    });
  }
};

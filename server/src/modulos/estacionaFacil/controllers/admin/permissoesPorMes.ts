import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";
import { toBrasiliaTime } from "@/utils/date";

interface Mes {
  mes: string;
  quantidade: number;
}

export const getPermissoesPorMes = async (req: Request, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();

    // Busca todas as permissões
    const todasPermissoes = await permitRepository.buscarTodasPermissoes();

    // Inicializa o array de meses
    const meses: Mes[] = [
      { mes: "Janeiro", quantidade: 0 },
      { mes: "Fevereiro", quantidade: 0 },
      { mes: "Março", quantidade: 0 },
      { mes: "Abril", quantidade: 0 },
      { mes: "Maio", quantidade: 0 },
      { mes: "Junho", quantidade: 0 },
      { mes: "Julho", quantidade: 0 },
      { mes: "Agosto", quantidade: 0 },
      { mes: "Setembro", quantidade: 0 },
      { mes: "Outubro", quantidade: 0 },
      { mes: "Novembro", quantidade: 0 },
      { mes: "Dezembro", quantidade: 0 },
    ];

    // Conta as permissões por mês
    todasPermissoes.forEach((permissao) => {
      if (permissao.paymentStatus === PaymentStatus.COMPLETED) {
        const dataInicio = toBrasiliaTime(permissao.startTime);
        const mes = dataInicio.getMonth();
        meses[mes].quantidade++;
      }
    });

    return res.json(meses);
  } catch (error) {
    console.error("Erro ao buscar permissões por mês:", error);
    return res.status(500).json({
      message: "Erro ao buscar permissões por mês",
    });
  }
};

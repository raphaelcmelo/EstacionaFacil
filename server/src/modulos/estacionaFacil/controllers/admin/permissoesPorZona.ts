import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";
import { toBrasiliaTime } from "@/utils/date";

interface Zona {
  zona: string;
  quantidade: number;
}

export const getPermissoesPorZona = async (req: Request, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();

    // Busca todas as permissões
    const todasPermissoes = await permitRepository.buscarTodasPermissoes();

    // Inicializa o array de zonas
    const zonas: Zona[] = [
      { zona: "Zona Azul", quantidade: 0 },
      { zona: "Zona Verde", quantidade: 0 },
      { zona: "Zona Amarela", quantidade: 0 },
      { zona: "Zona Vermelha", quantidade: 0 },
    ];

    // Conta as permissões por zona
    todasPermissoes.forEach((permissao) => {
      if (permissao.paymentStatus === PaymentStatus.COMPLETED) {
        const zonaIndex = zonas.findIndex((z) => z.zona === permissao.zone);
        if (zonaIndex !== -1) {
          zonas[zonaIndex].quantidade++;
        }
      }
    });

    return res.json(zonas);
  } catch (error) {
    console.error("Erro ao buscar permissões por zona:", error);
    return res.status(500).json({
      message: "Erro ao buscar permissões por zona",
    });
  }
};

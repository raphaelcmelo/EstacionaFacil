import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";
import { User } from "../../../gestorUsuarios/repositories/models/user.model";

interface AuthRequest extends Request {
  user?: User;
}

export const listarPermissoesAtivas = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const permitRepository = new MongoPermitRepository();
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    const now = new Date();
    const permissoes = await permitRepository.buscarAtivasPorUsuario(
      userId.toString(),
      now
    );

    // Formata as permissões para incluir todas as informações necessárias
    const permissoesFormatadas = permissoes.map((permissao) => ({
      id: permissao.id,
      placa: permissao.vehicleId,
      dataInicio: permissao.startTime,
      dataFim: permissao.endTime,
      valor: permissao.amount,
      status: permissao.paymentStatus,
      metodoPagamento: permissao.paymentMethod,
      codigoTransacao: permissao.transactionCode,
      duracaoHoras: permissao.durationHours,
      criadoEm: permissao.createdAt,
      atualizadoEm: permissao.updatedAt,
    }));

    return res.json(permissoesFormatadas);
  } catch (error) {
    console.error("Erro ao listar permissões ativas:", error);
    return res.status(500).json({
      message: "Erro ao listar permissões ativas",
    });
  }
};

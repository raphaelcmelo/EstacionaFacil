import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";

interface AuthRequest extends Request {
  user?: any;
}

export const listarTodasPermissoes = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const permitRepository = new MongoPermitRepository();
    const permissoes = await permitRepository.buscarTodasPermissoes();

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
    console.error("Erro ao listar permissões:", error);
    return res.status(500).json({
      message: "Erro ao listar permissões",
    });
  }
};

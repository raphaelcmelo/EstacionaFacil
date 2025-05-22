import { Request, Response } from "express";
import { MongoPermissaoRepository } from "../../repositories/mongodb/mongo.permissao.repository";
import { toBrasiliaTime } from "@/utils/date";

export const checkPermissao = async (req: Request, res: Response) => {
  try {
    const permissaoRepository = new MongoPermissaoRepository();
    const { placa, checkTime } = req.body;

    // Converte o checkTime para GMT-3
    const checkTimeBrasilia = toBrasiliaTime(checkTime);

    const permissaoAtiva = await permissaoRepository.buscarPermissaoAtiva(
      placa,
      checkTimeBrasilia
    );

    if (!permissaoAtiva) {
      // Verifica se existe alguma permissão para a placa, mesmo que expirada
      const qualquerPermissao = await permissaoRepository.buscarPorPlaca(placa);

      if (!qualquerPermissao) {
        return res.status(200).json({
          message: "Nenhuma permissão encontrada para este veículo",
          hasPermission: false,
          checkTime: checkTimeBrasilia.toISOString(),
        });
      }

      return res.status(200).json({
        message: "Nenhuma permissão ativa no momento",
        hasPermission: false,
        checkTime: checkTimeBrasilia.toISOString(),
      });
    }

    // Converte as datas da permissão para GMT-3
    const permissaoFormatada = {
      ...permissaoAtiva.toObject(),
      startDate: toBrasiliaTime(permissaoAtiva.startDate).toISOString(),
      endDate: toBrasiliaTime(permissaoAtiva.endDate).toISOString(),
      createdAt: toBrasiliaTime(permissaoAtiva.createdAt).toISOString(),
      updatedAt: toBrasiliaTime(permissaoAtiva.updatedAt).toISOString(),
    };

    return res.status(200).json({
      message: "Permissão ativa encontrada",
      hasPermission: true,
      permissao: permissaoFormatada,
      checkTime: checkTimeBrasilia.toISOString(),
    });
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
    });
  }
};

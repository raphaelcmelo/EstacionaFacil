import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { CheckPermission } from "../schemas/permission";

export const checkPermission = async (req: Request, res: Response) => {
  try {
    const { plate, checkTime } = req.body as CheckPermission;

    const permission = await prisma.permission.findFirst({
      where: {
        plate: plate.toUpperCase(),
        startDate: {
          lte: new Date(checkTime),
        },
        endDate: {
          gte: new Date(checkTime),
        },
      },
    });

    if (!permission) {
      // Verifica se existe alguma permissão para a placa, mesmo que expirada
      const anyPermission = await prisma.permission.findFirst({
        where: {
          plate: plate.toUpperCase(),
        },
      });

      if (!anyPermission) {
        return res.status(404).json({
          message: "Nenhuma permissão encontrada para este veículo",
        });
      }

      return res.status(400).json({
        message: "Nenhuma permissão ativa no momento",
      });
    }

    return res.status(200).json({
      message: "Permissão ativa encontrada",
      permission,
    });
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
    });
  }
};

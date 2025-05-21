import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { MongoPrecoRepository } from "../../repositories/mongodb/mongo.preco.repository";
import { PaymentStatus } from "@shared/schema";

export const criarPermit = async (req: Request, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();
    const precoRepository = new MongoPrecoRepository();
    const { licensePlate, model, durationHours, paymentMethod } = req.body;

    // Verifica se houve uma compra nos últimos 5 minutos
    const ultimaCompra = await permitRepository.buscarUltimaCompra(
      licensePlate
    );
    if (ultimaCompra) {
      const tempoDesdeUltimaCompra =
        Date.now() - ultimaCompra.createdAt.getTime();
      const cincoMinutosEmMs = 5 * 60 * 1000;

      if (tempoDesdeUltimaCompra < cincoMinutosEmMs) {
        return res.status(400).json({
          message:
            "É necessário aguardar 5 minutos entre as compras de permissão para o mesmo veículo",
        });
      }
    }

    // Busca a configuração de preço atual
    const { current: precoAtual } = await precoRepository.listar();
    if (!precoAtual) {
      return res.status(400).json({
        message: "Não há configuração de preço válida no momento",
      });
    }

    // Calcula o valor baseado na duração escolhida
    let amount = 0;
    switch (durationHours) {
      case 1:
        amount = precoAtual.hour1Price;
        break;
      case 2:
        amount = precoAtual.hour2Price;
        break;
      case 3:
        amount = precoAtual.hour3Price;
        break;
      case 4:
        amount = precoAtual.hour4Price;
        break;
      case 5:
        amount = precoAtual.hour5Price;
        break;
      case 6:
        amount = precoAtual.hour6Price;
        break;
      case 12:
        amount = precoAtual.hour12Price;
        break;
      default:
        return res.status(400).json({
          message: "Duração inválida",
        });
    }

    const now = new Date();
    let startTime = now;
    let endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    // Verifica se existe uma permissão ativa
    const permissaoAtiva = await permitRepository.buscarUltimaPermissaoAtiva(
      licensePlate
    );
    if (permissaoAtiva) {
      // Se existir, usa o horário de expiração da permissão ativa como base
      startTime = permissaoAtiva.endTime;
      endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    }

    // Se for método de teste, já marca como pago
    const paymentStatus =
      paymentMethod === "TESTE"
        ? PaymentStatus.COMPLETED
        : PaymentStatus.PENDING;

    const permit = await permitRepository.criar({
      vehicleId: licensePlate,
      durationHours,
      startTime,
      endTime,
      amount,
      paymentStatus,
      paymentMethod,
      transactionCode: Math.random().toString(36).substring(7).toUpperCase(),
    });

    return res.status(201).json(permit);
  } catch (error) {
    console.error("Erro ao criar permissão:", error);
    return res.status(500).json({
      message: "Erro ao criar permissão",
    });
  }
};

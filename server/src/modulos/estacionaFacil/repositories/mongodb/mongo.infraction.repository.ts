import { InfractionModel } from "../model/infraction.model";
import { toBrasiliaTime } from "@/utils/date";

export class MongoInfractionRepository {
  async criarInfracao(data: {
    vehicleId: string;
    fiscalId: string;
    fiscalName: string;
    checkTime: Date;
    location: string;
    description: string;
    amount: number;
  }) {
    const infracao = new InfractionModel({
      ...data,
      checkTime: toBrasiliaTime(data.checkTime),
    });

    await infracao.save();
    return infracao;
  }

  async buscarInfracoesPorVeiculo(vehicleId: string) {
    return InfractionModel.find({ vehicleId }).sort({ createdAt: -1 });
  }

  async buscarInfracoesPorFiscal(fiscalId: string) {
    return InfractionModel.find({ fiscalId }).sort({ createdAt: -1 });
  }

  async buscarInfracoesPorPeriodo(startDate: Date, endDate: Date) {
    return InfractionModel.find({
      checkTime: {
        $gte: toBrasiliaTime(startDate),
        $lte: toBrasiliaTime(endDate),
      },
    }).sort({ checkTime: -1 });
  }

  async atualizarStatus(id: string, status: "PENDING" | "PAID" | "CANCELLED") {
    const infracao = await InfractionModel.findById(id);
    if (!infracao) {
      throw new Error("Infração não encontrada");
    }

    infracao.status = status;
    await infracao.save();
    return infracao;
  }
}

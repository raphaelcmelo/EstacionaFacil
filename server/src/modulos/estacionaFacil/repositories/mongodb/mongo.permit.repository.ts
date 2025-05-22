import { PermitModel } from "../model/permit.model";
import { PermitRepository, PermitDocument } from "../ports/permit.repository";
import { PermitInput } from "../ports/permit.repository";
import { PaymentStatus } from "@shared/schema";

export class MongoPermitRepository implements PermitRepository {
  async criar(data: PermitInput): Promise<PermitDocument> {
    const permit = new PermitModel(data);
    await permit.save();
    return permit as unknown as PermitDocument;
  }

  async buscarPorPlaca(licensePlate: string): Promise<PermitDocument | null> {
    const permit = await PermitModel.findOne({
      vehicleId: licensePlate,
    }).sort({ createdAt: -1 });

    return permit as unknown as PermitDocument | null;
  }

  async atualizarStatus(
    id: string,
    status: string
  ): Promise<PermitDocument | null> {
    const permit = await PermitModel.findByIdAndUpdate(
      id,
      { paymentStatus: status },
      { new: true }
    );
    return permit as unknown as PermitDocument | null;
  }

  async buscarAtivasPorUsuario(
    userId: string,
    dataAtual: Date
  ): Promise<PermitDocument[]> {
    const permissoes = await PermitModel.find({
      userId,
      endTime: { $gt: dataAtual },
      paymentStatus: PaymentStatus.COMPLETED,
    }).sort({ endTime: 1 });

    return permissoes as unknown as PermitDocument[];
  }

  async buscarUltimaPermissaoAtiva(
    licensePlate: string
  ): Promise<PermitDocument | null> {
    const now = new Date();
    const permit = await PermitModel.findOne({
      vehicleId: licensePlate,
      endTime: { $gt: now },
      paymentStatus: PaymentStatus.COMPLETED,
    }).sort({ endTime: -1 });

    return permit as unknown as PermitDocument | null;
  }

  async buscarUltimaCompra(
    licensePlate: string
  ): Promise<PermitDocument | null> {
    const permit = await PermitModel.findOne({
      vehicleId: licensePlate,
    }).sort({ createdAt: -1 });

    return permit as unknown as PermitDocument | null;
  }

  async buscarPermissoesPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<PermitDocument[]> {
    const permissoes = await PermitModel.find({
      createdAt: {
        $gte: dataInicio,
        $lte: dataFim,
      },
    }).sort({ createdAt: -1 });

    return permissoes as unknown as PermitDocument[];
  }

  async buscarTodasPermissoes(): Promise<PermitDocument[]> {
    const permissoes = await PermitModel.find()
      .sort({ createdAt: -1 })
      .limit(10); // Limitando a 10 permissões mais recentes

    return permissoes as unknown as PermitDocument[];
  }
}

import { PermitModel } from "../model/permit.model";
import { PermitRepository } from "../ports/permit.repository";
import { PermitInput } from "../ports/permit.repository";

export class MongoPermitRepository implements PermitRepository {
  async criar(data: PermitInput) {
    const permit = new PermitModel(data);
    await permit.save();
    return permit;
  }

  async buscarPorPlaca(licensePlate: string) {
    const permit = await PermitModel.findOne({
      vehicleId: licensePlate,
    }).sort({ createdAt: -1 });

    return permit;
  }

  async atualizarStatus(id: string, status: string) {
    const permit = await PermitModel.findByIdAndUpdate(
      id,
      { paymentStatus: status },
      { new: true }
    );
    return permit;
  }
}

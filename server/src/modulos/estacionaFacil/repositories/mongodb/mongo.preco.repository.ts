import { Preco, PrecoModel } from "../model/preco.model";
import { PrecoInput, PrecoRepository } from "../ports/preco.repository";

export class MongoPrecoRepository implements PrecoRepository {
  async criar(data: PrecoInput): Promise<Preco> {
    const preco = await PrecoModel.create(data);
    return preco;
  }

  async listar(): Promise<{ current: Preco | null; history: Preco[] }> {
    const currentPrice = await PrecoModel.findOne({
      $or: [{ validTo: null }, { validTo: { $gt: new Date() } }],
    }).sort({ validFrom: -1 });

    const history = await PrecoModel.find({
      _id: { $ne: currentPrice?._id },
    }).sort({ validFrom: -1 });

    return {
      current: currentPrice,
      history,
    };
  }

  async editar(id: string, data: PrecoInput): Promise<Preco> {
    const preco = await PrecoModel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!preco) {
      throw new Error("Configuração de preço não encontrada");
    }

    return preco;
  }

  async deletar(id: string): Promise<Preco> {
    const preco = await PrecoModel.findByIdAndDelete(id);

    if (!preco) {
      throw new Error("Configuração de preço não encontrada");
    }

    return preco;
  }

  async verificarPeriodoValido(
    validFrom: Date,
    validTo: Date | null,
    id?: string
  ): Promise<boolean> {
    console.log("Verificando período válido:", {
      validFrom,
      validTo,
      id,
    });

    const query = {
      $and: [
        { _id: { $ne: id } },
        {
          $or: [
            {
              $and: [
                { validFrom: { $lte: validFrom } },
                {
                  $or: [{ validTo: null }, { validTo: { $gt: validFrom } }],
                },
              ],
            },
            {
              $and: [
                { validFrom: { $lte: validTo || new Date() } },
                {
                  $or: [
                    { validTo: null },
                    { validTo: { $gt: validTo || new Date() } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    console.log("Query de verificação:", JSON.stringify(query, null, 2));

    const count = await PrecoModel.countDocuments(query);
    console.log("Resultado da verificação:", { count });

    return count > 0;
  }
}

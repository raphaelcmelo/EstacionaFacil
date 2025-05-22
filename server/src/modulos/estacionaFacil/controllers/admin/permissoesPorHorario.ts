import { Request, Response } from "express";
import { MongoPermitRepository } from "../../repositories/mongodb/mongo.permit.repository";
import { PaymentStatus } from "@shared/schema";
import { createBrasiliaDate, toBrasiliaTime } from "@/utils/date";

interface Horario {
  hora: string;
  quantidade: number;
}

export const getPermissoesPorHorario = async (req: Request, res: Response) => {
  try {
    const permitRepository = new MongoPermitRepository();

    // Obtém a data de hoje em GMT-3
    const hoje = toBrasiliaTime(new Date());
    const inicioDoDia = createBrasiliaDate(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      8, // Início do horário de funcionamento
      0,
      0
    );
    const fimDoDia = createBrasiliaDate(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      18, // Fim do horário de funcionamento
      0,
      0
    );

    // Busca todas as permissões do dia
    const permissoesDoDia = await permitRepository.buscarPermissoesPorPeriodo(
      inicioDoDia,
      fimDoDia
    );

    // Inicializa o array de horários
    const horarios: Horario[] = [];
    for (let hora = 8; hora <= 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        horarios.push({
          hora: `${hora.toString().padStart(2, "0")}:${minuto
            .toString()
            .padStart(2, "0")}`,
          quantidade: 0,
        });
      }
    }

    // Conta as permissões por horário
    permissoesDoDia.forEach((permissao) => {
      if (permissao.paymentStatus === PaymentStatus.COMPLETED) {
        const dataInicio = toBrasiliaTime(permissao.startTime);
        const horaInicio = dataInicio.getHours();
        const minutoInicio = Math.floor(dataInicio.getMinutes() / 30) * 30;

        const horarioIndex = horarios.findIndex(
          (h) =>
            h.hora ===
            `${horaInicio.toString().padStart(2, "0")}:${minutoInicio
              .toString()
              .padStart(2, "0")}`
        );

        if (horarioIndex !== -1) {
          horarios[horarioIndex].quantidade++;
        }
      }
    });

    return res.json(horarios);
  } catch (error) {
    console.error("Erro ao buscar permissões por horário:", error);
    return res.status(500).json({
      message: "Erro ao buscar permissões por horário",
    });
  }
};

import { Document } from "mongoose";
import { PaymentStatus, PaymentMethod } from "@shared/schema";

export type PermitInput = {
  vehicleId: string;
  userId?: string;
  durationHours: number;
  startTime: Date;
  endTime: Date;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  transactionCode?: string;
  notificationSent?: boolean;
};

export interface PermitDocument extends Document {
  id: string;
  vehicleId: string;
  userId?: string;
  durationHours: number;
  startTime: Date;
  endTime: Date;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  transactionCode?: string;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermitRepository {
  criar(data: PermitInput): Promise<PermitDocument>;
  buscarPorPlaca(licensePlate: string): Promise<PermitDocument | null>;
  atualizarStatus(id: string, status: string): Promise<PermitDocument | null>;
  buscarAtivasPorUsuario(
    userId: string,
    dataAtual: Date
  ): Promise<PermitDocument[]>;
  buscarUltimaPermissaoAtiva(
    licensePlate: string
  ): Promise<PermitDocument | null>;
  buscarUltimaCompra(licensePlate: string): Promise<PermitDocument | null>;
  buscarPermissoesPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<PermitDocument[]>;
  buscarTodasPermissoes(): Promise<PermitDocument[]>;
}

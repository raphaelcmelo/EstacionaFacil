import { z } from "zod";

export enum UserRole {
  CITIZEN = "CITIZEN",
  FISCAL = "FISCAL",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PIX = "PIX",
  TESTE = "TESTE",
}

export enum VerificationResult {
  VALID = "VALID",
  EXPIRED = "EXPIRED",
  NOT_FOUND = "NOT_FOUND",
}

export enum InfringementType {
  NO_PERMIT = "NO_PERMIT",
  EXPIRED_PERMIT = "EXPIRED_PERMIT",
}

export enum InfringementStatus {
  REGISTERED = "REGISTERED",
  NOTIFIED = "NOTIFIED",
  CONTESTED = "CONTESTED",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

// Registration and login schemas
export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    cpf: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const quickBuySchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
  model: z.string().min(2, "Modelo deve ter pelo menos 2 caracteres"),
  durationHours: z.number().min(1).max(12),
  paymentMethod: z.enum([
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.PIX,
  ]),
});

export const checkPermitSchema = z.object({
  licensePlate: z
    .string()
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(8, "Placa deve ter no máximo 8 caracteres"),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type QuickBuyData = z.infer<typeof quickBuySchema>;
export type CheckPermitData = z.infer<typeof checkPermitSchema>;

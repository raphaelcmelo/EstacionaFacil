import { z } from "zod";
import { PaymentMethod } from "@shared/schema";

export const quickBuySchema = z.object({
  body: z.object({
    licensePlate: z.string().min(7).max(8),
    model: z.string().min(2),
    durationHours: z.number().min(1).max(12),
    paymentMethod: z.enum([
      PaymentMethod.CREDIT_CARD,
      PaymentMethod.DEBIT_CARD,
      PaymentMethod.PIX,
      PaymentMethod.TESTE,
    ]),
  }),
});

export const checkPermitSchema = z.object({
  body: z.object({
    licensePlate: z.string().min(7).max(8),
  }),
});

export const validateQuickBuyInput = (data: unknown) => {
  return quickBuySchema.parse(data);
};

export const validateCheckPermitInput = (data: unknown) => {
  return checkPermitSchema.parse(data);
};

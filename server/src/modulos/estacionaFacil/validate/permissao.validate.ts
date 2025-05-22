import { z } from "zod";

// Aceita placas no formato ABC1234 ou ABC1D23 (com ou sem hífen)
const placaRegex = /^(?:[A-Z]{3}-?\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/;

export const checkPermissaoSchema = z.object({
  body: z.object({
    placa: z
      .string()
      .transform((str) => str.toUpperCase().replace(/\s/g, ""))
      .refine((placa) => placaRegex.test(placa), {
        message: "Placa inválida. Use o formato 'ABC1234' ou 'ABC1D23'.",
      }),
    checkTime: z.string().transform((str) => new Date(str)),
  }),
});

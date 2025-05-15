import { z } from "zod";

const placaRegex = /^(?:[A-Z]{3}-\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/;

export const veiculoSchema = z.object({
  body: z.object({
    placa: z
      .string()
      .transform((str) => str.toUpperCase().replace(/\s/g, ""))
      .refine((placa) => placaRegex.test(placa), {
        message: "Placa inválida. Use o formato 'ABC-1234' ou 'ABC1D23'.",
      }),
    modelo: z.string().optional(),
  }),
});

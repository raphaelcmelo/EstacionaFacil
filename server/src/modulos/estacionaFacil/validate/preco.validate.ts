import { z } from "zod";
import { PrecoInput } from "../repositories/ports/preco.repository";

const precoSchema = z.object({
  validFrom: z.string(),
  validTo: z.string().nullable().optional(),
  hour1Price: z.number().min(0),
  hour2Price: z.number().min(0),
  hour3Price: z.number().min(0),
  hour4Price: z.number().min(0),
  hour5Price: z.number().min(0),
  hour6Price: z.number().min(0),
  hour12Price: z.number().min(0),
});

export const validatePrecoInput = (data: unknown): PrecoInput => {
  const validated = precoSchema.parse(data);
  return {
    ...validated,
    validFrom: new Date(validated.validFrom),
    validTo: validated.validTo ? new Date(validated.validTo) : null,
  };
};

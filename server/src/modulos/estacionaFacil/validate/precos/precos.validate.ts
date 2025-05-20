import { z } from "zod";

export const precoSchema = z.object({
  body: z.object({
    validFrom: z.string(),
    validTo: z.string().nullable().optional(),
    hour1Price: z.number().min(0),
    hour2Price: z.number().min(0),
    hour3Price: z.number().min(0),
    hour4Price: z.number().min(0),
    hour5Price: z.number().min(0),
    hour6Price: z.number().min(0),
    hour12Price: z.number().min(0),
  }),
});

export const validatePreco = (data: unknown) => {
  return precoSchema.parse(data);
};

export type Preco = z.infer<typeof precoSchema>;

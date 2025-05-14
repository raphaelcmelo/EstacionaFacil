import { z } from "zod";

export const pontoSchema = z.object({
  body: z.object({
    location: z.object({
      coordinates: z.array(z.number()).length(2, {
        message: "Deve conter exatamente 2 números (latitude e longitude)",
      }),
    }),
  }),
});

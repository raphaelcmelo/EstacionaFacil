import { z } from "zod";
import { objectId } from "../../../utils/objectId";

export const getUserSchema = z.object({
  params: z.object({
    userId: z.string().refine(objectId, { message: "ID inváliido" }),
  }),
});

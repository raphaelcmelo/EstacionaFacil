import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().min(1).email("E-mail inválido"),
    cpf: z
      .string()
      .min(1)
      .refine((value) => !value || cpfValidator.isValid(value), {
        message: "CPF inválido",
      }),
    phone: z.string().optional(),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  }),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "As senhas não coincidem",
//   path: ["confirmPassword"],
// });

export const loginSchema = z.object({
  body: z.object({
    cpf: z
      .string()
      .min(1)
      .refine((value) => !value || cpfValidator.isValid(value), {
        message: "CPF inválido",
      }),
    password: z.string().min(8),
  }),
});

import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  MONGODB_URL: z.string().url().min(1),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(1).describe("JWT secret key"),
  JWT_ACCESS_EXPIRATION_MINUTES: z
    .string()
    .default("30")
    .describe("minutes after which access tokens expire"),
  JWT_REFRESH_EXPIRATION_DAYS: z
    .string()
    .default("30")
    .describe("days after which refresh tokens expire"),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z
    .string()
    .default("10")
    .describe("minutes after which reset password token expires"),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z
    .string()
    .default("10")
    .describe("minutes after which verify email token expires"),

  FRONTEND_ORIGIN: z.string().url().min(1).describe("Frontend origin URL"),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("❌ Invalid environment variables", _env.error.format());

  throw new Error("Invalid environment variables.");
}

export const env = _env.data;

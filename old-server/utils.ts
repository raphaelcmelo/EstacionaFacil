import { ZodError } from "zod";

export function formatErrors(error: ZodError) {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join(".");
    acc[path] = err.message;
    return acc;
  }, {} as Record<string, string>);
}

export function generateTransactionCode() {
  const prefix = "EF";
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 8);
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}${timestamp}${randomPart}`;
}

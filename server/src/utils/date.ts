import { z } from "zod";

// Função auxiliar para converter data para GMT-3
export const toBrasiliaTime = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Date(
    dateObj.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
};

// Função para obter a data atual em GMT-3
export const getCurrentBrasiliaTime = (): Date => {
  return toBrasiliaTime(new Date());
};

// Função para criar uma data em GMT-3
export const createBrasiliaDate = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0
): Date => {
  const date = new Date(year, month, day, hours, minutes, seconds);
  return toBrasiliaTime(date);
};

// Função para obter início e fim do dia em GMT-3
export const getBrasiliaDayRange = (
  date: Date = new Date()
): { start: Date; end: Date } => {
  const brasiliaDate = toBrasiliaTime(date);
  const start = createBrasiliaDate(
    brasiliaDate.getFullYear(),
    brasiliaDate.getMonth(),
    brasiliaDate.getDate(),
    0,
    0,
    0
  );
  const end = createBrasiliaDate(
    brasiliaDate.getFullYear(),
    brasiliaDate.getMonth(),
    brasiliaDate.getDate(),
    23,
    59,
    59
  );
  return { start, end };
};

// Schema Zod para validação de datas em GMT-3
export const brasiliaDateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date)
    return toBrasiliaTime(arg);
  return arg;
}, z.date());

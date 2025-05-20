import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return "R$ 0,00";
  }
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return numValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy, HH:mm", { locale: ptBR });
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm", { locale: ptBR });
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `Hoje, ${format(dateObj, "HH:mm", { locale: ptBR })}`;
  } else if (isYesterday(dateObj)) {
    return `Ontem, ${format(dateObj, "HH:mm", { locale: ptBR })}`;
  } else {
    return format(dateObj, "dd/MM/yyyy, HH:mm", { locale: ptBR });
  }
}

export function formatTimeRemaining(endTime: Date | string): string {
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  const now = new Date();

  if (now > end) {
    return "Expirado";
  }

  const diffMs = end.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDuration(hours: number): string {
  return `${hours} ${hours === 1 ? "hora" : "horas"}`;
}

export function formatLicensePlate(plate: string): string {
  return plate.toUpperCase();
}

export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

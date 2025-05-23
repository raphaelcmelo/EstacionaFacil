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

export const maskPhoneNumber = (value: string): string => {
  let digits = value.replace(/\D/g, ""); // Trabalha apenas com dígitos
  let len = digits.length;

  if (len > 11) {
    digits = digits.substring(0, 11);
    len = 11;
  }

  if (len === 0) return "";
  if (len <= 2) return `(${digits}`;

  let masked = `(${digits.substring(0, 2)}) `;

  if (len === 11) {
    masked += digits.substring(2, 7);
    masked += `-${digits.substring(7, 11)}`;
  } else if (len <= 10) {
    masked += digits.substring(2, Math.min(len, 6));
    if (len > 6) {
      masked += `-${digits.substring(6, Math.min(len, 10))}`;
    }
  }

  return masked.trimRight();
};

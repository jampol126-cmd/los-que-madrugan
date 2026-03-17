import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function generateReferralCode(chatId: string): string {
  return `REF${chatId.slice(-6)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPerfilColor(perfil: string): string {
  const colors: Record<string, string> = {
    tienda: 'bg-blue-500',
    freelance: 'bg-purple-500',
    startup: 'bg-amber-500',
    profesional: 'bg-emerald-500',
  };
  return colors[perfil] || 'bg-gray-500';
}

export function getEstadoColor(estado: string): string {
  const colors: Record<string, string> = {
    activo: 'bg-emerald-500',
    trial: 'bg-amber-500',
    cancelado: 'bg-red-500',
  };
  return colors[estado] || 'bg-gray-500';
}

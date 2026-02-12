import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-") // Espaços para hifens
    .replace(/[^\w\-]+/g, "") // Remove caracteres especiais
    .replace(/\-\-+/g, "-") // Remove hifens duplicados
    .replace(/^-+/, "") // Remove hifens do início
    .replace(/-+$/, ""); // Remove hifens do fim
}

export function getDateRange(range: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let startDate = new Date(now);
  let endDate = new Date(now);
  // Por padrão endDate é hoje 23:59 (para ranges abertos como 'this_week')
  // Para ranges fechados (last_week), endDate será redefinido
  endDate.setHours(23, 59, 59, 999);

  switch (range) {
      case "today":
        // startDate já é hoje 00:00
        break;
      case "yesterday":
        startDate.setDate(now.getDate() - 1);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "this_week":
        startDate.setDate(now.getDate() - now.getDay()); // Domingo
        break;
      case "last_week":
        startDate.setDate(now.getDate() - now.getDay() - 7);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "last_year":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "all":
        startDate = new Date(2020, 0, 1); // Data bem antiga
        break;
  }
  
  return { startDate, endDate };
}

export function getPreviousDateRange(range: string) {
    const { startDate: currentStart, endDate: currentEnd } = getDateRange(range);
    
    // Calcular a duração do período atual em milissegundos
    const duration = currentEnd.getTime() - currentStart.getTime();
    
    // O final do período anterior é 1ms antes do início do atual
    const prevEnd = new Date(currentStart.getTime() - 1);
    
    // O início do período anterior é (fim anterior - duração)
    const prevStart = new Date(prevEnd.getTime() - duration);
    
    return { startDate: prevStart, endDate: prevEnd };
}

// src/utils/date.utils.ts

// Función segura para formatear fechas
export const formatDate = (date: Date | string | number | null | undefined): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    // Verificar si la fecha es válida antes de formatearla
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleDateString('es-AR');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Función segura para formatear fecha y hora
export const formatDateTime = (date: Date | string | number | null | undefined): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    // Verificar si la fecha es válida
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleString('es-AR');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

// Función para agregar días a una fecha
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Función para calcular fecha de finalización basada en una fecha de inicio y duración
export const calculateEndDate = (startDate: Date | string, durationDays: number): Date => {
  const start = new Date(startDate);
  return addDays(start, durationDays);
};

// Exportaciones por defecto para mantener compatibilidad
export default {
  formatDate,
  formatDateTime,
  addDays,
  calculateEndDate
};
// src/utils/formatting.utils.ts

export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  export const formatPhone = (phone: string): string => {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  };
  
  export const formatCUIT = (cuit: string): string => {
    if (!cuit) return '';
    
    const cleaned = cuit.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
    }
    
    return cuit;
  };
  
  export default {
    formatCurrency,
    formatPhone,
    formatCUIT
  };
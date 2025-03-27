// src/utils/date.utils.ts

export const formatDate = (date: Date | string | number): string => {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR');
  };
  
  export const formatDateTime = (date: Date | string | number): string => {
    const d = new Date(date);
    return d.toLocaleString('es-AR');
  };
  
  export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  export const calculateEndDate = (startDate: Date | string, durationDays: number): Date => {
    const start = new Date(startDate);
    return addDays(start, durationDays);
  };
  
  export {};
  
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
  
  export {};
  
  // src/utils/storage.utils.ts
  
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { storage } from '../config/firebase';
  
  export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
    return uploadFile(file, `profile_photos/${userId}`);
  };
  
  export const uploadGymLogo = async (file: File, gymId: string): Promise<string> => {
    return uploadFile(file, `gym_logos/${gymId}`);
  };
  
  export {};
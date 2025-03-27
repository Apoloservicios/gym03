// src/services/gym.service.ts

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import { Gym, BusinessProfile } from '../types/gym.types';
  import { uploadFile } from '../utils/storage.utils';
  
  // Obtener información del gimnasio
  export const getGymInfo = async (gymId: string): Promise<Gym | null> => {
    try {
      const gymRef = doc(db, 'gyms', gymId);
      const gymSnap = await getDoc(gymRef);
      
      if (gymSnap.exists()) {
        return { id: gymSnap.id, ...gymSnap.data() } as Gym;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting gym info:', error);
      throw error;
    }
  };
  
  // Actualizar información de perfil del negocio
  export const updateBusinessProfile = async (gymId: string, profileData: BusinessProfile, logoFile?: File | null): Promise<boolean> => {
    try {
      const gymRef = doc(db, 'gyms', gymId);
      
      let logoUrl = profileData.logo;
      
      // Si hay un nuevo logo, subirlo
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, `gym_logos/${gymId}`);
      }
      
      // Actualizar perfil
      await updateDoc(gymRef, {
        name: profileData.name,
        address: profileData.address,
        phone: profileData.phone,
        cuit: profileData.cuit,
        email: profileData.email,
        website: profileData.website,
        socialMedia: profileData.socialMedia,
        logo: logoUrl,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  };
  
  export default {
    getGymInfo,
    updateBusinessProfile
  };
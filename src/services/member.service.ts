// src/services/member.service.ts

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Member, MemberFormData, MembershipAssignment } from '../types/member.types';
import { uploadFile } from '../utils/storage.utils';

// Agregar un nuevo socio
export const addMember = async (gymId: string, memberData: MemberFormData): Promise<Member> => {
  try {
    const membersRef = collection(db, `gyms/${gymId}/members`);
    
    // Si hay foto, subirla
    let photoUrl = null;
    if (memberData.photo) {
      const newMemberRef = doc(membersRef);
      photoUrl = await uploadFile(memberData.photo, `profile_photos/${newMemberRef.id}`);
    }
    
    // Crear socio
    const newMember = {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      phone: memberData.phone,
      address: memberData.address,
      birthDate: memberData.birthDate,
      photo: photoUrl,
      status: memberData.status,
      totalDebt: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(membersRef, newMember);
    
    return { 
      id: docRef.id, 
      ...newMember,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Member;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

// Asignar membresía a un socio
export const assignMembership = async (
  gymId: string, 
  memberId: string, 
  membershipData: Omit<MembershipAssignment, 'id'>
): Promise<MembershipAssignment> => {
  try {
    const membershipsRef = collection(db, `gyms/${gymId}/members/${memberId}/memberships`);
    
    // Agregar membresía
    const docRef = await addDoc(membershipsRef, {
      ...membershipData,
      createdAt: serverTimestamp()
    });
    
    // Si la membresía tiene un costo y está pendiente, agregar a la deuda del socio
    if (membershipData.cost > 0 && membershipData.paymentStatus === 'pending') {
      const memberRef = doc(db, `gyms/${gymId}/members`, memberId);
      const memberSnap = await getDoc(memberRef);
      
      if (memberSnap.exists()) {
        const currentDebt = memberSnap.data().totalDebt || 0;
        await updateDoc(memberRef, {
          totalDebt: currentDebt + membershipData.cost,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return { 
      id: docRef.id,
      ...membershipData 
    };
  } catch (error) {
    console.error('Error assigning membership:', error);
    throw error;
  }
};

// Generar código QR para socio
export const generateMemberQR = async (gymId: string, memberId: string): Promise<string> => {
  try {
    const memberRef = doc(db, `gyms/${gymId}/members`, memberId);
    
    // Generar datos para el QR
    const qrData = {
      gymId,
      memberId,
      timestamp: new Date().getTime()
    };
    
    // Convertir a string seguro para QR
    const qrString = Buffer.from(JSON.stringify(qrData)).toString('base64');
    
    // Actualizar el registro del socio con la cadena de QR
    await updateDoc(memberRef, {
      qrCode: qrString,
      updatedAt: serverTimestamp()
    });
    
    return qrString;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Obtener todas las membresías de un socio
export const getMemberMemberships = async (gymId: string, memberId: string): Promise<MembershipAssignment[]> => {
  try {
    const membershipsRef = collection(db, `gyms/${gymId}/members/${memberId}/memberships`);
    const querySnapshot = await getDocs(membershipsRef);
    
    const memberships: MembershipAssignment[] = [];
    querySnapshot.forEach(doc => {
      memberships.push({
        id: doc.id,
        ...doc.data()
      } as MembershipAssignment);
    });
    
    // Ordenar por estado (activas primero) y fecha de finalización (más recientes primero)
    return memberships.sort((a, b) => {
      // Primero ordenar por estado (activas primero)
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      
      // Si ambas tienen el mismo estado, ordenar por fecha de finalización (más recientes primero)
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error getting member memberships:', error);
    throw error;
  }
};

export default {
  addMember,
  assignMembership,
  generateMemberQR,
  getMemberMemberships
};
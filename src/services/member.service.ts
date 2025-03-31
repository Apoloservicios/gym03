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
import { uploadToCloudinary } from '../utils/cloudinary.utils';

// Agregar un nuevo socio
export const addMember = async (gymId: string, memberData: MemberFormData): Promise<Member> => {
  try {
    console.log("Iniciando proceso de agregar miembro con datos:", JSON.stringify({
      ...memberData,
      photo: memberData.photo ? `[File: ${memberData.photo.name}]` : null
    }));
    
    const membersRef = collection(db, `gyms/${gymId}/members`);
    
    // Si hay foto, intentamos subirla primero
    let photoUrl = null;
    if (memberData.photo) {
      try {
        console.log("Intentando subir foto a Cloudinary...");
        // La ruta de la carpeta debe ser consistente con tu estructura en Cloudinary
        photoUrl = await uploadToCloudinary(memberData.photo, "gym_member_photos");
        console.log("Foto subida exitosamente:", photoUrl);
      } catch (uploadError) {
        console.error("Error subiendo foto:", uploadError);
        // Si falla la carga de la foto, continuamos sin ella
      }
    }
    
    // Datos del nuevo miembro
    const newMember = {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      phone: memberData.phone,
      address: memberData.address || "",
      birthDate: memberData.birthDate || "",
      photo: photoUrl,
      status: memberData.status,
      totalDebt: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log("Guardando miembro con datos:", JSON.stringify({
      ...newMember,
      createdAt: "timestamp",
      updatedAt: "timestamp"
    }));
    
    // Agregar a Firestore
    const docRef = await addDoc(membersRef, newMember);
    
    console.log("Miembro creado con ID:", docRef.id);
    
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

// El resto del archivo se mantiene igual...

// Asignar membresía a un socio
export const assignMembership = async (
  gymId: string, 
  memberId: string, 
  membershipData: Omit<MembershipAssignment, 'id'>
): Promise<MembershipAssignment> => {
  try {
    console.log("Asignando membresía:", membershipData);
    const membershipsRef = collection(db, `gyms/${gymId}/members/${memberId}/memberships`);
    
    // Agregar membresía
    const docRef = await addDoc(membershipsRef, {
      ...membershipData,
      createdAt: serverTimestamp()
    });
    
    console.log("Membresía asignada con ID:", docRef.id);
    
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
        console.log("Deuda actualizada a:", currentDebt + membershipData.cost);
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

export const updateMember = async (gymId: string, memberId: string, memberData: MemberFormData): Promise<boolean> => {
  try {
    console.log("Iniciando actualización de miembro:", memberId);
    
    const memberRef = doc(db, `gyms/${gymId}/members`, memberId);
    
    // Si hay una nueva foto, subirla
    let photoUrl = undefined; // undefined significa que no se actualiza este campo
    if (memberData.photo instanceof File) {
      try {
        console.log("Intentando subir nueva foto...");
        photoUrl = await uploadToCloudinary(memberData.photo, "gym_member_photos");
        console.log("Nueva foto subida:", photoUrl);
      } catch (uploadError) {
        console.error("Error subiendo nueva foto:", uploadError);
        // Si falla, continuamos sin actualizar la foto
      }
    }
    
    // Preparar datos para actualizar
    const updateData: any = {
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      email: memberData.email,
      phone: memberData.phone,
      address: memberData.address || "",
      birthDate: memberData.birthDate || "",
      status: memberData.status,
      updatedAt: serverTimestamp()
    };
    
    // Solo actualizar la foto si se subió exitosamente
    if (photoUrl !== undefined) {
      updateData.photo = photoUrl;
    }
    
    console.log("Actualizando miembro con datos:", JSON.stringify({
      ...updateData,
      updatedAt: "timestamp"
    }));
    
    // Actualizar en Firestore
    await updateDoc(memberRef, updateData);
    
    console.log("Miembro actualizado exitosamente");
    return true;
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

export default {
  addMember,
  assignMembership,
  generateMemberQR,
  getMemberMemberships,
  updateMember
};
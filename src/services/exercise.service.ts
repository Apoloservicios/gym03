// src/services/exercise.service.ts

import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import { Exercise, MuscleGroup, DifficultyLevel } from '../types/exercise.types';
  import { uploadToCloudinary } from '../utils/cloudinary.utils';
  


  export const getGlobalExercises = async (): Promise<Exercise[]> => {
    try {
      const exercisesRef = collection(db, 'globalExercises');
      const q = query(exercisesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const exercises: Exercise[] = [];
      querySnapshot.forEach(doc => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      return exercises;
    } catch (error) {
      console.error('Error getting global exercises:', error);
      throw error;
    }
  };
  
  // Crear un nuevo ejercicio global
  export const createGlobalExercise = async (
    exerciseData: Omit<Exercise, 'id'>, 
    imageFile?: File
  ): Promise<Exercise> => {
    try {
      // Si hay imagen, subirla a Cloudinary
      let imageUrl = null;
      if (imageFile) {
        try {
          imageUrl = await uploadToCloudinary(imageFile, 'global_exercises');
        } catch (uploadError) {
          console.error('Error uploading exercise image:', uploadError);
          // Continuar sin imagen
        }
      }
      
      // Crear el ejercicio en Firestore
      const exercisesRef = collection(db, 'globalExercises');
      
      const newExercise = {
        ...exerciseData,
        image: imageUrl,
        isActive: exerciseData.isActive !== undefined ? exerciseData.isActive : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(exercisesRef, newExercise);
      
      return {
        id: docRef.id,
        ...newExercise,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Exercise;
    } catch (error) {
      console.error('Error creating global exercise:', error);
      throw error;
    }
  };
  
  // Actualizar un ejercicio global existente
  export const updateGlobalExercise = async (
    exerciseId: string,
    exerciseData: Partial<Exercise>,
    imageFile?: File
  ): Promise<Exercise> => {
    try {
      const exerciseRef = doc(db, 'globalExercises', exerciseId);
      
      // Si hay una nueva imagen, subirla
      let imageUrl = undefined; // undefined significa que no se actualiza este campo
      if (imageFile) {
        try {
          imageUrl = await uploadToCloudinary(imageFile, 'global_exercises');
        } catch (uploadError) {
          console.error('Error uploading exercise image:', uploadError);
          // Continuar sin actualizar la imagen
        }
      }
      
      // Preparar datos para actualizar
      const updateData: any = {
        ...exerciseData,
        updatedAt: serverTimestamp()
      };
      
      // Solo incluir la imagen si se subió una nueva
      if (imageUrl !== undefined) {
        updateData.image = imageUrl;
      }
      
      await updateDoc(exerciseRef, updateData);
      
      // Obtener los datos actualizados
      const updatedDoc = await getDoc(exerciseRef);
      
      if (!updatedDoc.exists()) {
        throw new Error('El ejercicio no existe');
      }
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Exercise;
    } catch (error) {
      console.error('Error updating global exercise:', error);
      throw error;
    }
  };
  
  // Eliminar un ejercicio global
  export const deleteGlobalExercise = async (exerciseId: string): Promise<boolean> => {
    try {
      const exerciseRef = doc(db, 'globalExercises', exerciseId);
      await deleteDoc(exerciseRef);
      return true;
    } catch (error) {
      console.error('Error deleting global exercise:', error);
      throw error;
    }
  };
  
  // Obtener ejercicios globales por grupo muscular
  export const getGlobalExercisesByMuscleGroup = async (
    muscleGroup: MuscleGroup
  ): Promise<Exercise[]> => {
    try {
      const exercisesRef = collection(db, 'globalExercises');
      const q = query(
        exercisesRef,
        where('muscleGroup', '==', muscleGroup),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      
      const exercises: Exercise[] = [];
      querySnapshot.forEach(doc => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      return exercises;
    } catch (error) {
      console.error('Error getting global exercises by muscle group:', error);
      throw error;
    }
  };
  
  // Importar ejercicio global a un gimnasio específico
  export const importGlobalExerciseToGym = async (
    gymId: string, 
    globalExerciseId: string
  ): Promise<boolean> => {
    try {
      // Obtener ejercicio global
      const globalExerciseRef = doc(db, 'globalExercises', globalExerciseId);
      const globalExerciseSnap = await getDoc(globalExerciseRef);
      
      if (!globalExerciseSnap.exists()) {
        throw new Error('El ejercicio global no existe');
      }
      
      const globalExercise = globalExerciseSnap.data() as Exercise;
      
      // Crear ejercicio en el gimnasio
      const gymExercisesRef = collection(db, `gyms/${gymId}/exercises`);
      
      // Omitir campos que no deben ser copiados
      const { id, createdAt, updatedAt, ...exerciseData } = globalExercise;
      
      // Añadir campo para rastrear origen
      const gymExerciseData = {
        ...exerciseData,
        globalOrigin: globalExerciseId,
        isGlobal: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(gymExercisesRef, gymExerciseData);
      
      return true;
    } catch (error) {
      console.error('Error importing global exercise to gym:', error);
      throw error;
    }
  };






  // Obtener todos los ejercicios particulares del gym 
  export const getExercises = async (gymId: string): Promise<Exercise[]> => {
    try {
      const exercisesRef = collection(db, `gyms/${gymId}/exercises`);
      const q = query(exercisesRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const exercises: Exercise[] = [];
      querySnapshot.forEach(doc => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      return exercises;
    } catch (error) {
      console.error('Error getting exercises:', error);
      throw error;
    }
  };
  
  // Obtener ejercicios por grupo muscular
  export const getExercisesByMuscleGroup = async (gymId: string, muscleGroup: MuscleGroup): Promise<Exercise[]> => {
    try {
      const exercisesRef = collection(db, `gyms/${gymId}/exercises`);
      const q = query(
        exercisesRef,
        where('muscleGroup', '==', muscleGroup),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      
      const exercises: Exercise[] = [];
      querySnapshot.forEach(doc => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      return exercises;
    } catch (error) {
      console.error(`Error getting exercises for muscle group ${muscleGroup}:`, error);
      throw error;
    }
  };
  
  // Obtener ejercicios por nivel de dificultad
  export const getExercisesByDifficulty = async (gymId: string, difficulty: DifficultyLevel): Promise<Exercise[]> => {
    try {
      const exercisesRef = collection(db, `gyms/${gymId}/exercises`);
      const q = query(
        exercisesRef,
        where('difficulty', '==', difficulty),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      
      const exercises: Exercise[] = [];
      querySnapshot.forEach(doc => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      return exercises;
    } catch (error) {
      console.error(`Error getting exercises for difficulty ${difficulty}:`, error);
      throw error;
    }
  };
  
  // Obtener un ejercicio por su ID
  export const getExerciseById = async (gymId: string, exerciseId: string): Promise<Exercise | null> => {
    try {
      const exerciseRef = doc(db, `gyms/${gymId}/exercises`, exerciseId);
      const exerciseSnap = await getDoc(exerciseRef);
      
      if (exerciseSnap.exists()) {
        return {
          id: exerciseSnap.id,
          ...exerciseSnap.data()
        } as Exercise;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting exercise by ID:', error);
      throw error;
    }
  };
  
 // En src/services/exercise.service.ts

export const createExercise = async (gymId: string, exerciseData: any): Promise<Exercise> => {
  try {
    const exercisesRef = collection(db, `gyms/${gymId}/exercises`);
    
    // Crear una copia y limpiar los campos undefined
    const sanitizedData: Record<string, any> = {};
    
    // Solo incluir campos con valores definidos (no undefined)
    Object.keys(exerciseData).forEach(key => {
      if (exerciseData[key] !== undefined) {
        // Para mayor seguridad, convertir undefined a null para Firestore
        sanitizedData[key] = exerciseData[key] === undefined ? null : exerciseData[key];
      }
    });
    
    // Asegurarse de que campos requeridos estén presentes
    const requiredFields = ['name', 'description', 'muscleGroup', 'difficulty', 'instructions'];
    requiredFields.forEach(field => {
      if (!sanitizedData.hasOwnProperty(field)) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    });
    
    // Incluir campos adicionales para Firestore
    const dataToSave = {
      ...sanitizedData,
      isActive: sanitizedData.isActive !== undefined ? sanitizedData.isActive : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(exercisesRef, dataToSave);
    
    return {
      id: docRef.id,
      ...dataToSave
    } as Exercise;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};
  
  // Actualizar un ejercicio existente
  export const updateExercise = async (
    gymId: string, 
    exerciseId: string, 
    exerciseData: Partial<Exercise>
  ): Promise<boolean> => {
    try {
      const exerciseRef = doc(db, `gyms/${gymId}/exercises`, exerciseId);
      
      // Incluir timestamp de actualización
      await updateDoc(exerciseRef, {
        ...exerciseData,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  };
  
  // Eliminar un ejercicio
  export const deleteExercise = async (gymId: string, exerciseId: string): Promise<boolean> => {
    try {
      const exerciseRef = doc(db, `gyms/${gymId}/exercises`, exerciseId);
      await deleteDoc(exerciseRef);
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  };
  
  // Marcar un ejercicio como activo/inactivo
  export const toggleExerciseStatus = async (
    gymId: string, 
    exerciseId: string, 
    isActive: boolean
  ): Promise<boolean> => {
    try {
      const exerciseRef = doc(db, `gyms/${gymId}/exercises`, exerciseId);
      
      await updateDoc(exerciseRef, {
        isActive: isActive,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling exercise status:', error);
      throw error;
    }
  };
  
  export default {
    getExercises,
    getExercisesByMuscleGroup,
    getExercisesByDifficulty,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    toggleExerciseStatus
  };
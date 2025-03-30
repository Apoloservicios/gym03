// src/services/dailyCash.service.ts

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  serverTimestamp, 
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  DailyCash, 
  Transaction, 
  TransactionCategory, 
  TransactionIncomeCategory, 
  TransactionExpenseCategory 
} from '../types/gym.types';

// Obtener la caja diaria actual o crearla si no existe
export const getCurrentDailyCash = async (gymId: string): Promise<DailyCash> => {
  try {
    // Obtener la fecha actual en formato yyyy-MM-dd
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Referencia al documento de la caja del día
    const dailyCashRef = doc(db, `gyms/${gymId}/dailyCash`, formattedDate);
    const dailyCashSnap = await getDoc(dailyCashRef);
    
    if (dailyCashSnap.exists()) {
      // Si ya existe un registro para hoy, retornarlo
      return {
        id: dailyCashSnap.id,
        ...dailyCashSnap.data()
      } as DailyCash;
    } else {
      // Si no existe, crear un nuevo registro de caja diaria
      const newDailyCash = {
        date: formattedDate,
        openingTime: Timestamp.now(),
        openingAmount: 0, // Se asume que se inicia con 0, podría ser configurable
        totalIncome: 0,
        totalExpense: 0,
        membershipIncome: 0,
        otherIncome: 0,
        status: 'open',
        openedBy: '', // Esto se debería completar con el ID del usuario actual
        notes: 'Caja diaria abierta automáticamente',
        createdAt: serverTimestamp()
      };
      
      await setDoc(dailyCashRef, newDailyCash);
      
      return {
        id: formattedDate,
        ...newDailyCash
      } as DailyCash;
    }
  } catch (error) {
    console.error('Error getting current daily cash:', error);
    throw error;
  }
};

// Obtener registro de caja diaria por fecha
export const getDailyCashByDate = async (gymId: string, date: string): Promise<DailyCash | null> => {
  try {
    const dailyCashRef = doc(db, `gyms/${gymId}/dailyCash`, date);
    const dailyCashSnap = await getDoc(dailyCashRef);
    
    if (dailyCashSnap.exists()) {
      return {
        id: dailyCashSnap.id,
        ...dailyCashSnap.data()
      } as DailyCash;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting daily cash by date:', error);
    throw error;
  }
};

// Obtener registros de caja para un rango de fechas
export const getDailyCashForDateRange = async (
  gymId: string, 
  startDate: string, 
  endDate: string
): Promise<DailyCash[]> => {
  try {
    const dailyCashRef = collection(db, `gyms/${gymId}/dailyCash`);
    const q = query(
      dailyCashRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const dailyCashList: DailyCash[] = [];
    
    querySnapshot.forEach(doc => {
      dailyCashList.push({
        id: doc.id,
        ...doc.data()
      } as DailyCash);
    });
    
    return dailyCashList;
  } catch (error) {
    console.error('Error getting daily cash for date range:', error);
    throw error;
  }
};

// Registrar un ingreso extra (no relacionado con membresías)
export const registerExtraIncome = async (
  gymId: string,
  data: {
    amount: number;
    description: string;
    paymentMethod: string;
    date: string;
    userId: string;
    userName: string;
    category?: string;
    notes?: string;
  }
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    // Referencia al documento de la caja diaria
    const dailyCashRef = doc(db, `gyms/${gymId}/dailyCash`, data.date);
    const dailyCashSnap = await getDoc(dailyCashRef);
    
    // Validar que la categoría es válida para ingresos
    const category = data.category || 'extra';
    const validCategories: TransactionIncomeCategory[] = ['membership', 'extra', 'product', 'service', 'other'];
    
    if (!validCategories.includes(category as TransactionIncomeCategory)) {
      throw new Error(`Categoría inválida para ingresos: ${category}`);
    }
    
    // Crear transacción
    const transactionData: Partial<Transaction> = {
      type: 'income',
      category: category as TransactionIncomeCategory,
      amount: data.amount,
      description: data.description,
      date: Timestamp.fromDate(new Date(data.date)),
      userId: data.userId,
      userName: data.userName,
      paymentMethod: data.paymentMethod,
      status: 'completed',
      notes: data.notes,
      createdAt: serverTimestamp()
    };
    
    // Referencia a la colección de transacciones
    const transactionsRef = collection(db, `gyms/${gymId}/transactions`);
    
    // Crear la transacción
    const transactionRef = await addDoc(transactionsRef, transactionData);
    
    if (dailyCashSnap.exists()) {
      // Actualizar el registro existente
      const dailyCashData = dailyCashSnap.data() as DailyCash;
      
      await updateDoc(dailyCashRef, {
        totalIncome: (dailyCashData.totalIncome || 0) + data.amount,
        otherIncome: (dailyCashData.otherIncome || 0) + data.amount,
        updatedAt: serverTimestamp()
      });
    } else {
      // Crear un nuevo registro de caja diaria
      await setDoc(dailyCashRef, {
        date: data.date,
        openingTime: Timestamp.now(),
        openingAmount: 0,
        totalIncome: data.amount,
        totalExpense: 0,
        membershipIncome: 0,
        otherIncome: data.amount,
        status: 'open',
        openedBy: data.userId,
        notes: 'Creado automáticamente al registrar un ingreso',
        createdAt: serverTimestamp()
      });
    }
    
    return {
      success: true,
      transactionId: transactionRef.id
    };
  } catch (error: any) {
    console.error('Error registering extra income:', error);
    return {
      success: false,
      error: error.message || 'Error al registrar el ingreso'
    };
  }
};

// Registrar un gasto o retiro
export const registerExpense = async (
  gymId: string,
  data: {
    amount: number;
    description: string;
    paymentMethod: string;
    date: string;
    userId: string;
    userName: string;
    category?: string;
    notes?: string;
  }
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    // Referencia al documento de la caja diaria
    const dailyCashRef = doc(db, `gyms/${gymId}/dailyCash`, data.date);
    const dailyCashSnap = await getDoc(dailyCashRef);
    
    // Validar que la categoría es válida para gastos
    const category = data.category || 'withdrawal';
    const validCategories: TransactionExpenseCategory[] = ['withdrawal', 'supplier', 'services', 'maintenance', 'salary', 'other'];
    
    if (!validCategories.includes(category as TransactionExpenseCategory)) {
      throw new Error(`Categoría inválida para gastos: ${category}`);
    }
    
    // Crear transacción
    const transactionData: Partial<Transaction> = {
      type: 'expense',
      category: category as TransactionExpenseCategory,
      amount: data.amount,
      description: data.description,
      date: Timestamp.fromDate(new Date(data.date)),
      userId: data.userId,
      userName: data.userName,
      paymentMethod: data.paymentMethod,
      status: 'completed',
      notes: data.notes,
      createdAt: serverTimestamp()
    };
    
    // Referencia a la colección de transacciones
    const transactionsRef = collection(db, `gyms/${gymId}/transactions`);
    
    // Crear la transacción
    const transactionRef = await addDoc(transactionsRef, transactionData);
    
    if (dailyCashSnap.exists()) {
      // Actualizar el registro existente
      const dailyCashData = dailyCashSnap.data() as DailyCash;
      
      await updateDoc(dailyCashRef, {
        totalExpense: (dailyCashData.totalExpense || 0) + data.amount,
        updatedAt: serverTimestamp()
      });
    } else {
      // Crear un nuevo registro de caja diaria
      await setDoc(dailyCashRef, {
        date: data.date,
        openingTime: Timestamp.now(),
        openingAmount: 0,
        totalIncome: 0,
        totalExpense: data.amount,
        membershipIncome: 0,
        otherIncome: 0,
        status: 'open',
        openedBy: data.userId,
        notes: 'Creado automáticamente al registrar un gasto',
        createdAt: serverTimestamp()
      });
    }
    
    return {
      success: true,
      transactionId: transactionRef.id
    };
  } catch (error: any) {
    console.error('Error registering expense:', error);
    return {
      success: false,
      error: error.message || 'Error al registrar el gasto'
    };
  }
};

// Cerrar la caja diaria
export const closeDailyCash = async (
  gymId: string,
  date: string,
  data: {
    closingAmount: number;
    notes?: string;
    userId: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const dailyCashRef = doc(db, `gyms/${gymId}/dailyCash`, date);
    const dailyCashSnap = await getDoc(dailyCashRef);
    
    if (!dailyCashSnap.exists()) {
      return {
        success: false,
        error: 'No existe un registro de caja para esta fecha'
      };
    }
    
    await updateDoc(dailyCashRef, {
      closingTime: Timestamp.now(),
      closingAmount: data.closingAmount,
      status: 'closed',
      closedBy: data.userId,
      notes: data.notes,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error closing daily cash:', error);
    return {
      success: false,
      error: error.message || 'Error al cerrar la caja'
    };
  }
};

// Obtener las transacciones para un día específico
export const getTransactionsByDate = async (
  gymId: string,
  date: string
): Promise<Transaction[]> => {
  try {
    // Convertir la fecha a objetos Date para el inicio y fin del día
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const transactionsRef = collection(db, `gyms/${gymId}/transactions`);
    const q = query(
      transactionsRef,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as Transaction);
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions by date:', error);
    throw error;
  }
};

// Obtener resumen de transacciones para un rango de fechas (para reportes)
export const getTransactionsSummary = async (
  gymId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalIncome: number;
  totalExpense: number;
  membershipIncome: number;
  otherIncome: number;
  transactionsByType: Record<string, number>;
  transactionsByCategory: Record<string, number>;
}> => {
  try {
    // Convertir las fechas
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const transactionsRef = collection(db, `gyms/${gymId}/transactions`);
    const q = query(
      transactionsRef,
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end)),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as Transaction);
    });
    
    // Calcular totales
    let totalIncome = 0;
    let totalExpense = 0;
    let membershipIncome = 0;
    let otherIncome = 0;
    
    const transactionsByType: Record<string, number> = {};
    const transactionsByCategory: Record<string, number> = {};
    
    transactions.forEach(tx => {
      // Incrementar totales por tipo
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        
        // Incrementar por categoría de ingreso
        if (tx.category === 'membership') {
          membershipIncome += tx.amount;
        } else {
          otherIncome += tx.amount;
        }
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
      }
      
      // Contabilizar por tipo
      transactionsByType[tx.type] = (transactionsByType[tx.type] || 0) + tx.amount;
      
      // Contabilizar por categoría
      const category = tx.category || 'other';
      transactionsByCategory[category] = (transactionsByCategory[category] || 0) + tx.amount;
    });
    
    return {
      totalIncome,
      totalExpense,
      membershipIncome,
      otherIncome,
      transactionsByType,
      transactionsByCategory
    };
  } catch (error) {
    console.error('Error getting transactions summary:', error);
    throw error;
  }
};

export default {
  getCurrentDailyCash,
  getDailyCashByDate,
  getDailyCashForDateRange,
  registerExtraIncome,
  registerExpense,
  closeDailyCash,
  getTransactionsByDate,
  getTransactionsSummary
};
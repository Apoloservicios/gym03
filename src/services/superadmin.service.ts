// src/services/superadmin.service.ts

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
    deleteDoc
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import { Gym } from '../types/auth.types';
  
  // Definir tipos necesarios
  export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    duration: number; // en días
    features: string[];
    isActive: boolean;
    createdAt: any;
  }
  
  export interface GymSubscription {
    id: string;
    gymId: string;
    planId: string;
    planName: string;
    startDate: any;
    endDate: any;
    price: number;
    status: 'active' | 'expired' | 'cancelled';
    paymentMethod: string;
    paymentDate: any;
    renewalRequested: boolean;
    autoRenewal: boolean;
    notes?: string;
    createdAt: any;
  }
  
  // Obtener todos los gimnasios
  export const getGyms = async (): Promise<Gym[]> => {
    try {
      const gymsRef = collection(db, 'gyms');
      const querySnapshot = await getDocs(gymsRef);
      
      const gyms: Gym[] = [];
      querySnapshot.forEach(doc => {
        gyms.push({
          id: doc.id,
          ...doc.data()
        } as Gym);
      });
      
      return gyms;
    } catch (error) {
      console.error('Error getting gyms:', error);
      throw error;
    }
  };
  
  // Activar gimnasio
  export const activateGym = async (gymId: string): Promise<boolean> => {
    try {
      const gymRef = doc(db, 'gyms', gymId);
      
      await updateDoc(gymRef, {
        status: 'active',
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error activating gym:', error);
      throw error;
    }
  };
  
  // Desactivar/suspender gimnasio
  export const deactivateGym = async (gymId: string): Promise<boolean> => {
    try {
      const gymRef = doc(db, 'gyms', gymId);
      
      await updateDoc(gymRef, {
        status: 'suspended',
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error deactivating gym:', error);
      throw error;
    }
  };
  
  // Obtener planes de suscripción
  export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    try {
      const plansRef = collection(db, 'subscriptionPlans');
      const q = query(plansRef, where('isActive', '==', true), orderBy('price'));
      const querySnapshot = await getDocs(q);
      
      const plans: SubscriptionPlan[] = [];
      querySnapshot.forEach(doc => {
        plans.push({
          id: doc.id,
          ...doc.data()
        } as SubscriptionPlan);
      });
      
      return plans;
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      throw error;
    }
  };
  
  // Crear nuevo plan de suscripción
  export const createSubscriptionPlan = async (planData: Omit<SubscriptionPlan, 'id' | 'createdAt'>): Promise<SubscriptionPlan> => {
    try {
      const plansRef = collection(db, 'subscriptionPlans');
      
      const docRef = await addDoc(plansRef, {
        ...planData,
        isActive: true,
        createdAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...planData,
        createdAt: new Date()
      } as SubscriptionPlan;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  };
  
  // Actualizar plan de suscripción
  export const updateSubscriptionPlan = async (
    planId: string,
    planData: Partial<Omit<SubscriptionPlan, 'id' | 'createdAt'>>
  ): Promise<SubscriptionPlan> => {
    try {
      const planRef = doc(db, 'subscriptionPlans', planId);
      await updateDoc(planRef, {
        ...planData,
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(planRef);
      
      if (!updatedDoc.exists()) {
        throw new Error('El plan no existe');
      }
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as SubscriptionPlan;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  };
  
  // Eliminar plan de suscripción
  export const deleteSubscriptionPlan = async (planId: string): Promise<boolean> => {
    try {
      const planRef = doc(db, 'subscriptionPlans', planId);
      await deleteDoc(planRef);
      return true;
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  };
  
  // Asignar suscripción a gimnasio
  export const assignSubscription = async (
    gymId: string,
    planId: string,
    startDate: Date,
    paymentMethod: string,
    notes?: string
  ): Promise<GymSubscription> => {
    try {
      // Obtener el plan seleccionado
      const planRef = doc(db, 'subscriptionPlans', planId);
      const planSnap = await getDoc(planRef);
      
      if (!planSnap.exists()) {
        throw new Error('El plan seleccionado no existe');
      }
      
      const plan = { id: planSnap.id, ...planSnap.data() } as SubscriptionPlan;
      
      // Calcular fecha de finalización
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration);
      
      // Crear registro de suscripción
      const subscriptionData = {
        gymId,
        planId,
        planName: plan.name,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        price: plan.price,
        status: 'active',
        paymentMethod,
        paymentDate: Timestamp.fromDate(new Date()),
        renewalRequested: false,
        autoRenewal: false,
        notes,
        createdAt: serverTimestamp()
      };
      
      const subscriptionsRef = collection(db, 'subscriptions');
      const docRef = await addDoc(subscriptionsRef, subscriptionData);
      
      // Actualizar el gimnasio
      const gymRef = doc(db, 'gyms', gymId);
      await updateDoc(gymRef, {
        status: 'active',
        'subscriptionData.plan': plan.name,
        'subscriptionData.startDate': Timestamp.fromDate(startDate),
        'subscriptionData.endDate': Timestamp.fromDate(endDate),
        'subscriptionData.price': plan.price,
        'subscriptionData.paymentMethod': paymentMethod,
        'subscriptionData.lastPayment': Timestamp.fromDate(new Date()),
        'subscriptionData.renewalRequested': false,
        updatedAt: serverTimestamp()
      });
      
      // Crear registro de pago
      const paymentData = {
        subscriptionId: docRef.id,
        gymId,
        amount: plan.price,
        date: Timestamp.fromDate(new Date()),
        method: paymentMethod,
        status: 'completed',
        notes,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'subscriptionPayments'), paymentData);
      
      return {
        id: docRef.id,
        ...subscriptionData
      } as GymSubscription;
    } catch (error) {
      console.error('Error assigning subscription:', error);
      throw error;
    }
  };
  
  // Función simplificada para obtener estadísticas
  export const getSubscriptionStats = async (): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    expiringSubscriptions: number;
    newSubscriptions: number;
  }> => {
    try {
      // Esta función puede ser simplificada para evitar problemas iniciales
      // Simulando datos para pruebas
      return {
        totalRevenue: 10000,
        monthlyRevenue: 2000,
        activeSubscriptions: 10,
        expiringSubscriptions: 2,
        newSubscriptions: 3
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw error;
    }
  };
  
  // Obtener historial de pagos
  export const getPaymentHistory = async (): Promise<any[]> => {
    try {
      const paymentsRef = collection(db, 'subscriptionPayments');
      const q = query(paymentsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const payments: any[] = [];
      querySnapshot.forEach(doc => {
        payments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return payments;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  };
// src/components/superadmin/GymSubscriptionModal.tsx

import React, { useState, useEffect } from 'react';
import { getSubscriptionPlans } from '../../services/superadmin.service';
import { formatCurrency } from '../../utils/formatting.utils';

interface GymSubscriptionModalProps {
  gym: any;
  onClose: () => void;
  onSave: (planId: string, startDate: string, paymentMethod: string, notes?: string) => void;
}

const GymSubscriptionModal: React.FC<GymSubscriptionModalProps> = ({ gym, onClose, onSave }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('transfer');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
        if (plansData.length > 0) {
          setSelectedPlanId(plansData[0].id);
        }
      } catch (error) {
        console.error('Error cargando planes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlanId || !startDate || !paymentMethod) {
      return;
    }
    
    onSave(selectedPlanId, startDate, paymentMethod, notes);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Asignar Plan de Suscripción</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        
        <div className="mb-4">
          <p className="font-medium">{gym.name}</p>
          <p className="text-sm text-gray-500">Propietario: {gym.owner}</p>
          {gym.status !== 'trial' && gym.subscriptionData && (
            <p className="text-sm text-gray-500">
              Plan actual: {gym.subscriptionData.plan || 'Sin plan'} - Vence: {
                gym.subscriptionData.endDate?.toDate().toLocaleDateString('es-AR') || 'No disponible'
              }
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Plan</label>
              <select 
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                required
              >
                <option value="">Seleccione un plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {formatCurrency(plan.price)} - {plan.duration} días
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
              <input 
                type="date" 
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select 
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="transfer">Transferencia Bancaria</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta de Crédito/Débito</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea 
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GymSubscriptionModal;
// src/components/superadmin/SubscriptionPlansPanel.tsx

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash, DollarSign, Calendar, Check, X, AlertCircle, Info 
} from 'lucide-react';
import { 
  getSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan 
} from '../../services/superadmin.service';
import { SubscriptionPlan } from '../../types/subscription.types';
import { formatCurrency } from '../../utils/formatting.utils';
import SuperAdminHeader from './SuperAdminHeader';
import SubscriptionPlanForm from './SubscriptionPlanForm';

const SubscriptionPlansPanel: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  useEffect(() => {
    loadPlans();
  }, []);
  
  const loadPlans = async () => {
    setLoading(true);
    try {
      const plansData = await getSubscriptionPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Error cargando planes:', error);
      setError('Error al cargar planes de suscripción. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewPlan = () => {
    setSelectedPlan(null);
    setIsEditing(false);
    setShowForm(true);
  };
  
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`¿Estás seguro que deseas eliminar el plan "${plan.name}"?`)) {
      return;
    }
    
    try {
      await deleteSubscriptionPlan(plan.id);
      // Actualizar la lista
      setPlans(prev => prev.filter(p => p.id !== plan.id));
    } catch (error) {
      console.error('Error eliminando plan:', error);
      setError('Error al eliminar el plan. Por favor, intenta nuevamente.');
    }
  };
  
  const handleSavePlan = async (planData: any) => {
    try {
      if (isEditing && selectedPlan) {
        // Actualizar plan existente
        const updatedPlan = await updateSubscriptionPlan(selectedPlan.id, planData);
        // Actualizar la lista
        setPlans(prev => 
          prev.map(p => p.id === selectedPlan.id ? updatedPlan : p)
        );
      } else {
        // Crear nuevo plan
        const newPlan = await createSubscriptionPlan(planData);
        // Actualizar la lista
        setPlans(prev => [...prev, newPlan]);
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Error guardando plan:', error);
      setError('Error al guardar el plan. Por favor, intenta nuevamente.');
    }
  };
  
  return (
    <div className="p-6">
      <SuperAdminHeader />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Planes de Suscripción</h1>
        
        <button
          onClick={handleNewPlan}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Nuevo Plan
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {showForm ? (
        <SubscriptionPlanForm
          initialData={selectedPlan}
          isEditing={isEditing}
          onSave={handleSavePlan}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Info size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes de suscripción</h3>
              <p className="text-gray-500 mb-6">Comienza creando tu primer plan para ofrecer a los gimnasios</p>
              <button
                onClick={handleNewPlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Crear Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(plan.price)}</div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Calendar size={20} className="text-gray-400 mr-3" />
                      <span>{plan.duration} días</span>
                    </div>
                    
                    <ul className="space-y-2">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-6 bg-gray-50 border-t">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="px-3 py-1 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        <Edit size={16} className="inline mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                      >
                        <Trash size={16} className="inline mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionPlansPanel;
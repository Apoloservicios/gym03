import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Clock, Check, X } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description: string;
  maxAttendances: number;
  cost: number;
}

interface FormData {
  activityId: string;
  startDate: string;
  duration: number;
  cost: number | string;
  paymentStatus: 'paid' | 'pending';
}

interface FormErrors {
  activityId?: string;
  startDate?: string;
  cost?: string;
  form?: string;
}

interface MembershipFormProps {
  memberId: string;
  memberName: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const MembershipForm: React.FC<MembershipFormProps> = ({ memberId, memberName, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    activityId: '',
    startDate: '',
    duration: 30,
    cost: '',
    paymentStatus: 'pending'
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Cargar actividades (simulado)
  useEffect(() => {
    // En una implementación real, esto vendría de la base de datos
    setActivities([
      { id: 'activity1', name: 'Musculación', description: 'Acceso a sala de pesas', maxAttendances: 30, cost: 10000 },
      { id: 'activity2', name: 'Crossfit', description: 'Clases grupales de alta intensidad', maxAttendances: 12, cost: 12000 },
      { id: 'activity3', name: 'Pilates', description: 'Clases de Pilates reformer', maxAttendances: 8, cost: 14000 },
      { id: 'activity4', name: 'Yoga', description: 'Clases de yoga y meditación', maxAttendances: 8, cost: 9000 }
    ]);
    
    // Establecer fecha de inicio al día actual por defecto
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      ...formData,
      startDate: today
    });
  }, []);
  
  // Actualizar costo cuando se selecciona una actividad
  useEffect(() => {
    if (formData.activityId) {
      const selectedActivity = activities.find(a => a.id === formData.activityId);
      if (selectedActivity) {
        setFormData({
          ...formData,
          cost: selectedActivity.cost
        });
      }
    }
  }, [formData.activityId, activities]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convertir a número cuando sea apropiado
    const parsedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
    
    // Limpiar error del campo cuando se edita
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.activityId) {
      newErrors.activityId = 'Debe seleccionar una actividad';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!formData.cost || Number(formData.cost) <= 0) {
      newErrors.cost = 'El costo debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const calculateEndDate = () => {
    if (!formData.startDate || !formData.duration) return 'No disponible';
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + formData.duration);
    
    return endDate.toLocaleDateString('es-AR');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Obtener información adicional de la actividad seleccionada
      const selectedActivity = activities.find(a => a.id === formData.activityId);
      
      if (!selectedActivity) {
        throw new Error('Actividad no encontrada');
      }
      
      const membershipData = {
        ...formData,
        activityName: selectedActivity.name,
        description: selectedActivity.description,
        maxAttendances: selectedActivity.maxAttendances,
        currentAttendances: 0,
        memberId,
        endDate: (() => {
          const startDate = new Date(formData.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + formData.duration);
          return endDate.toISOString();
        })(),
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Simular guardado (reemplazar con lógica real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(membershipData);
      }
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      setErrors({
        ...errors,
        form: 'Ocurrió un error al guardar. Intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-2">Asignar Membresía</h2>
      <p className="text-gray-600 mb-6">Socio: {memberName}</p>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Actividad */}
          <div>
            <label htmlFor="activityId" className="block text-sm font-medium text-gray-700 mb-1">
              Actividad *
            </label>
            <select
              id="activityId"
              name="activityId"
              value={formData.activityId}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.activityId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Seleccionar actividad</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} - ${activity.cost}
                </option>
              ))}
            </select>
            {errors.activityId && (
              <p className="mt-1 text-sm text-red-600">{errors.activityId}</p>
            )}
            
            {formData.activityId && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                <p className="font-medium">{activities.find(a => a.id === formData.activityId)?.description}</p>
                <p className="mt-1">Asistencias máximas: {activities.find(a => a.id === formData.activityId)?.maxAttendances}</p>
              </div>
            )}
          </div>
          
          {/* Fecha de inicio */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={18} className="text-gray-400" />
              </div>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>
          
          {/* Duración */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duración (días)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock size={18} className="text-gray-400" />
              </div>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 días</option>
                <option value="60">60 días</option>
                <option value="90">90 días</option>
                <option value="180">180 días</option>
                <option value="365">365 días</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Fecha de finalización: {calculateEndDate()}
            </p>
          </div>
          
          {/* Costo */}
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
              Costo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-gray-400" />
              </div>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className={`pl-10 w-full px-4 py-2 border ${errors.cost ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            {errors.cost && (
              <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
            )}
          </div>
          
          {/* Estado de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Pago
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="paid"
                  checked={formData.paymentStatus === 'paid'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Pagada</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="pending"
                  checked={formData.paymentStatus === 'pending'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Pendiente</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <X size={18} className="mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <Check size={18} className="mr-2" />
            )}
            {loading ? 'Guardando...' : 'Asignar Membresía'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MembershipForm;
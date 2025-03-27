// src/components/settings/MembershipManagement.tsx

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, ChevronDown, ChevronUp, DollarSign, Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';
import { Membership, Activity, MembershipFormData, FormErrors } from '../../types/membership.types';

interface MembershipManagementProps {}

const MembershipManagement: React.FC<MembershipManagementProps> = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null);
  const [expandedMembership, setExpandedMembership] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MembershipFormData>({
    activityId: '',
    name: '',
    description: '',
    cost: '',
    duration: 30,
    maxAttendances: ''
  });
  
  // Validación de formulario
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Cargar datos de membresías y actividades
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Simulamos carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Actividades de ejemplo
        const sampleActivities: Activity[] = [
          { id: 'act1', name: 'Musculación', description: 'Acceso a sala de pesas y máquinas' },
          { id: 'act2', name: 'Pilates', description: 'Clases de pilates reformer' },
          { id: 'act3', name: 'Yoga', description: 'Clases de yoga y meditación' },
          { id: 'act4', name: 'Zumba', description: 'Clases de baile y ejercicio' },
          { id: 'act5', name: 'Crossfit', description: 'Entrenamiento funcional de alta intensidad' }
        ];
        
        // Membresías de ejemplo
        const sampleMemberships: Membership[] = [
          { 
            id: 'mem1', 
            activityId: 'act1',
            activityName: 'Musculación',
            name: 'Musculación Mensual',
            description: 'Acceso ilimitado a sala de musculación durante 30 días',
            cost: 10000,
            duration: 30,
            maxAttendances: 30,
            isPopular: true,
            activeMembers: 42
          },
          { 
            id: 'mem2', 
            activityId: 'act2',
            activityName: 'Pilates', 
            name: 'Pilates 8 clases',
            description: 'Pack de 8 clases de pilates. Validez 30 días',
            cost: 14000, 
            duration: 30,
            maxAttendances: 8,
            isPopular: false,
            activeMembers: 15
          },
          { 
            id: 'mem3', 
            activityId: 'act3',
            activityName: 'Yoga', 
            name: 'Yoga 4 clases',
            description: 'Pack de 4 clases de yoga. Validez 30 días',
            cost: 8000, 
            duration: 30,
            maxAttendances: 4,
            isPopular: false,
            activeMembers: 8
          },
          { 
            id: 'mem4', 
            activityId: 'act1',
            activityName: 'Musculación', 
            name: 'Musculación Trimestral',
            description: 'Acceso ilimitado a sala de musculación durante 90 días',
            cost: 25000, 
            duration: 90,
            maxAttendances: 90,
            isPopular: false,
            activeMembers: 23
          },
          { 
            id: 'mem5', 
            activityId: 'act5',
            activityName: 'Crossfit', 
            name: 'Crossfit 12 clases',
            description: 'Pack de 12 clases de crossfit. Validez 30 días',
            cost: 18000, 
            duration: 30,
            maxAttendances: 12,
            isPopular: true,
            activeMembers: 31
          }
        ];
        
        setActivities(sampleActivities);
        setMemberships(sampleMemberships);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convertir a número cuando sea apropiado
    const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
    
    // Limpiar error del campo cuando se edita
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.activityId) {
      newErrors.activityId = 'Debe seleccionar una actividad';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (!formData.cost || Number(formData.cost) <= 0) {
      newErrors.cost = 'El costo debe ser mayor a 0';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'La duración debe ser mayor a 0';
    }
    
    if (!formData.maxAttendances || Number(formData.maxAttendances) <= 0) {
      newErrors.maxAttendances = 'Las asistencias máximas deben ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Abrir modal para nueva membresía
  const handleNewMembership = () => {
    setFormData({
      activityId: '',
      name: '',
      description: '',
      cost: '',
      duration: 30,
      maxAttendances: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };
  
  // Abrir modal para editar membresía
  const handleEditMembership = (membership: Membership) => {
    setFormData({
      activityId: membership.activityId,
      name: membership.name,
      description: membership.description,
      cost: String(membership.cost),
      duration: membership.duration,
      maxAttendances: String(membership.maxAttendances)
    });
    setCurrentMembership(membership);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  
  // Abrir modal para confirmar eliminación
  const handleDeleteClick = (membership: Membership) => {
    setCurrentMembership(membership);
    setIsDeleteModalOpen(true);
  };
  
  // Confirmar eliminación
  const confirmDelete = () => {
    if (!currentMembership) return;
    
    // Aquí iría la lógica para eliminar de la base de datos
    setMemberships(prevMemberships => 
      prevMemberships.filter(m => m.id !== currentMembership.id)
    );
    setIsDeleteModalOpen(false);
    setCurrentMembership(null);
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Aquí iría la lógica para guardar en la base de datos
    try {
      // Simulamos operación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditing && currentMembership) {
        // Actualizar membresía existente
        setMemberships(prevMemberships => 
          prevMemberships.map(m => 
            m.id === currentMembership.id 
              ? { 
                  ...m, 
                  activityId: formData.activityId,
                  activityName: activities.find(a => a.id === formData.activityId)?.name || '',
                  name: formData.name,
                  description: formData.description,
                  cost: Number(formData.cost),
                  duration: formData.duration,
                  maxAttendances: Number(formData.maxAttendances)
                } 
              : m
          )
        );
      } else {
        // Crear nueva membresía
        const newMembership: Membership = {
          id: `mem${Date.now()}`,
          activityId: formData.activityId,
          activityName: activities.find(a => a.id === formData.activityId)?.name || '',
          name: formData.name,
          description: formData.description,
          cost: Number(formData.cost),
          duration: formData.duration,
          maxAttendances: Number(formData.maxAttendances),
          isPopular: false,
          activeMembers: 0
        };
        
        setMemberships(prevMemberships => [...prevMemberships, newMembership]);
      }
      
      setIsModalOpen(false);
      setCurrentMembership(null);
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      setErrors({
        ...errors,
        form: 'Ocurrió un error al guardar. Intente nuevamente.'
      });
    }
  };
  
  // Formatear monto
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  // Manejar expansión/colapso de detalles
  const toggleExpand = (id: string) => {
    setExpandedMembership(expandedMembership === id ? null : id);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Membresías</h2>
          <p className="text-gray-600 mt-1">Configura las membresías disponibles en tu gimnasio</p>
        </div>
        
        <button 
          onClick={handleNewMembership}
          className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Nueva Membresía
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-500">Cargando membresías...</p>
        </div>
      ) : memberships.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <DollarSign size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No hay membresías configuradas</h3>
          <p className="text-gray-500 mb-4">Comienza creando tu primera membresía para ofrecerla a tus socios</p>
          <button 
            onClick={handleNewMembership}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Crear Membresía
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {memberships.map((membership) => (
            <div key={membership.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white cursor-pointer"
                onClick={() => toggleExpand(membership.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium">{membership.name}</h3>
                    {membership.isPopular && (
                      <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{membership.activityName}</p>
                </div>
                
                <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="text-xl font-bold text-gray-800">{formatAmount(membership.cost)}</div>
                  
                  <div className="mt-2 sm:mt-0 flex items-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMembership(membership);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(membership);
                      }}
                      className="ml-2 text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash size={18} />
                    </button>
                    <button className="ml-2 text-gray-600 p-1">
                      {expandedMembership === membership.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              
              {expandedMembership === membership.id && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Detalles</h4>
                      <p className="text-sm text-gray-600">{membership.description}</p>
                      
                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <span>Duración: {membership.duration} días</span>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>Asistencias: {membership.maxAttendances}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Estadísticas</h4>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-white p-3 rounded-md border flex-1 min-w-[120px]">
                          <p className="text-sm text-gray-600">Socios activos</p>
                          <p className="text-xl font-bold text-gray-800 mt-1">{membership.activeMembers}</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded-md border flex-1 min-w-[120px]">
                          <p className="text-sm text-gray-600">Ingresos mensuales</p>
                          <p className="text-xl font-bold text-gray-800 mt-1">{formatAmount(membership.cost * 30)}</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded-md border flex-1 min-w-[120px]">
                          <p className="text-sm text-gray-600">Costo por día</p>
                          <p className="text-xl font-bold text-gray-800 mt-1">{formatAmount(membership.cost / membership.duration)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal para crear/editar membresía */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Editar Membresía' : 'Nueva Membresía'}</h2>
            
            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                <AlertCircle size={18} className="mr-2" />
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
                        {activity.name}
                      </option>
                    ))}
                  </select>
                  {errors.activityId && (
                    <p className="mt-1 text-sm text-red-600">{errors.activityId}</p>
                  )}
                </div>
                
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ej: Musculación Mensual"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                {/* Descripción */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Describe los beneficios y condiciones"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
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
                      placeholder="0"
                      min="0"
                      step="100"
                    />
                  </div>
                  {errors.cost && (
                    <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                  )}
                </div>
                
                {/* Duración y Asistencias */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duración (días) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className={`pl-10 w-full px-4 py-2 border ${errors.duration ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="30"
                        min="1"
                      />
                    </div>
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="maxAttendances" className="block text-sm font-medium text-gray-700 mb-1">
                      Asistencias Máx. *
                    </label>
                    <input
                      type="number"
                      id="maxAttendances"
                      name="maxAttendances"
                      value={formData.maxAttendances}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.maxAttendances ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="30"
                      min="1"
                    />
                    {errors.maxAttendances && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxAttendances}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <X size={18} className="mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
                >
                  <Check size={18} className="mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && currentMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Eliminar Membresía</h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro que deseas eliminar la membresía <strong>{currentMembership.name}</strong>? Esta acción no se puede deshacer.
              </p>
              
              {currentMembership.activeMembers > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-left">
                  <p className="text-sm text-yellow-800">
                    <strong>¡Advertencia!</strong> Esta membresía tiene {currentMembership.activeMembers} socios activos. 
                    Al eliminarla, no afectará a las membresías ya asignadas, pero no podrás asignarla a nuevos socios.
                  </p>
                </div>
              )}
              
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManagement;
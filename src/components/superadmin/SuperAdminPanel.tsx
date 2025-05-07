// src/components/superadmin/SuperAdminPanel.tsx

import React, { useState, useEffect } from 'react';
import { 
  Globe, CheckCircle, XCircle, Info, RefreshCw, BarChart2, 
  Users, DollarSign, Calendar, Building, Plus, Search, Filter 
} from 'lucide-react';
import { 
  getGyms, 
  activateGym, 
  deactivateGym,
  assignSubscription 
} from '../../services/superadmin.service';
import { formatCurrency } from '../../utils/formatting.utils';
import SuperAdminHeader from './SuperAdminHeader';
import GymSubscriptionModal from './GymSubscriptionModal';

type GymStatus = 'all' | 'active' | 'trial' | 'suspended' | 'expired';
type DateRange = '7days' | '30days' | '90days' | 'year' | 'all';

const SuperAdminPanel: React.FC = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<GymStatus>('all');
  const [dateFilter, setDateFilter] = useState<DateRange>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedGym, setSelectedGym] = useState<any | null>(null);
  
  // Carga inicial de gimnasios
  useEffect(() => {
    loadGyms();
  }, []);
  
  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters();
  }, [gyms, searchTerm, statusFilter, dateFilter]);
  
  const loadGyms = async () => {
    setLoading(true);
    try {
      const gymsData = await getGyms();
      setGyms(gymsData);
    } catch (error) {
      console.error('Error cargando gimnasios:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...gyms];
    
    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(gym => 
        gym.name?.toLowerCase().includes(search) ||
        gym.owner?.toLowerCase().includes(search) ||
        gym.email?.toLowerCase().includes(search) ||
        gym.phone?.toLowerCase().includes(search)
      );
    }
    
    // Filtro por estado
    if (statusFilter !== 'all') {
      result = result.filter(gym => gym.status === statusFilter);
    }
    
    // Filtro por fecha de registro
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      result = result.filter(gym => {
        if (!gym.registrationDate) return false;
        const registrationDate = gym.registrationDate.toDate ? 
          gym.registrationDate.toDate() : new Date(gym.registrationDate);
        return registrationDate >= cutoffDate;
      });
    }
    
    setFilteredGyms(result);
  };
  
  const handleAssignSubscription = (gym: any) => {
    setSelectedGym(gym);
    setShowModal(true);
  };
  
  const handleToggleGymStatus = async (gym: any, activate: boolean) => {
    try {
      if (activate) {
        await activateGym(gym.id);
      } else {
        await deactivateGym(gym.id);
      }
      
      // Actualizar localmente
      setGyms(prev => prev.map(g => {
        if (g.id === gym.id) {
          return {
            ...g,
            status: activate ? 'active' : 'suspended'
          };
        }
        return g;
      }));
    } catch (error) {
      console.error('Error cambiando estado del gimnasio:', error);
    }
  };
  
  const formatDate = (date: any): string => {
    try {
      if (date && date.toDate) {
        const d = date.toDate();
        return d.toLocaleDateString('es-AR');
      }
      return new Date(date).toLocaleDateString('es-AR');
    } catch (e) {
      return 'Fecha inválida';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activo
          </span>
        );
      case 'trial':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Prueba
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Suspendido
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Expirado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Desconocido'}
          </span>
        );
    }
  };
  
  const handleSaveSubscription = async (planId: string, startDate: string, paymentMethod: string, notes?: string) => {
    try {
      if (!selectedGym) return;
      
      await assignSubscription(
        selectedGym.id,
        planId,
        new Date(startDate),
        paymentMethod,
        notes
      );
      
      // Cerrar modal y recargar datos
      setShowModal(false);
      loadGyms();
    } catch (error) {
      console.error('Error al asignar suscripción:', error);
      alert('Ocurrió un error al asignar la suscripción. Por favor, intenta nuevamente.');
    }
  };
  
  return (
    <div className="p-6">
      <SuperAdminHeader activePage="dashboard" />
      
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
            // src/components/superadmin/SuperAdminPanel.tsx (continuación)

<p className="text-sm text-gray-500 font-medium">Total Gimnasios</p>
<h2 className="text-3xl font-bold mt-2">{gyms.length}</h2>
</div>
<div className="text-2xl p-3 rounded-full bg-blue-100 text-blue-600">
<Globe size={20} />
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow-md p-6">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-500 font-medium">Suscripciones Activas</p>
<h2 className="text-3xl font-bold mt-2">{gyms.filter(gym => gym.status === 'active').length}</h2>
</div>
<div className="text-2xl p-3 rounded-full bg-green-100 text-green-600">
<CheckCircle size={20} />
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow-md p-6">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-500 font-medium">En Período de Prueba</p>
<h2 className="text-3xl font-bold mt-2">{gyms.filter(gym => gym.status === 'trial').length}</h2>
</div>
<div className="text-2xl p-3 rounded-full bg-blue-100 text-blue-600">
<Info size={20} />
</div>
</div>
</div>

<div className="bg-white rounded-lg shadow-md p-6">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-500 font-medium">Suspendidos/Expirados</p>
<h2 className="text-3xl font-bold mt-2">
  {gyms.filter(gym => ['suspended', 'expired'].includes(gym.status || '')).length}
</h2>
</div>
<div className="text-2xl p-3 rounded-full bg-red-100 text-red-600">
<XCircle size={20} />
</div>
</div>
</div>
</div>

{/* Gimnasios con próximo vencimiento */}
<div className="bg-white rounded-lg shadow-md p-6 mb-8">
<h2 className="text-lg font-semibold mb-4">Próximos Vencimientos</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{gyms
.filter(gym => gym.status === 'active' || gym.status === 'trial')
.sort((a, b) => {
const dateA = a.subscriptionData?.endDate?.toDate() || a.trialEndsAt?.toDate();
const dateB = b.subscriptionData?.endDate?.toDate() || b.trialEndsAt?.toDate();

if (!dateA) return 1;
if (!dateB) return -1;

return dateA.getTime() - dateB.getTime();
})
.slice(0, 3)
.map(gym => (
<div key={gym.id} className="border rounded-md p-4 relative">
  <div className="absolute top-4 right-4">
    {getStatusBadge(gym.status)}
  </div>
  <h3 className="font-medium">{gym.name}</h3>
  <p className="text-sm text-gray-500">
    Vence: {formatDate(gym.status === 'trial' ? gym.trialEndsAt : gym.subscriptionData?.endDate)}
  </p>
  <div className="mt-2 flex justify-between items-center">
    <span className="text-sm">
      {gym.status === 'trial' ? 'Periodo de prueba' : gym.subscriptionData?.plan || 'Sin plan'}
    </span>
    <button 
      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
      onClick={() => handleAssignSubscription(gym)}
    >
      <RefreshCw className="inline mr-1" size={16} />
      {gym.status === 'trial' ? 'Asignar Plan' : 'Renovar'}
    </button>
  </div>
</div>
))
}
</div>
</div>

{/* Lista de gimnasios */}
<div className="bg-white rounded-lg shadow-md overflow-hidden">
<div className="p-4 border-b">
<div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
<div className="relative flex-1">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  <Search size={18} className="text-gray-400" />
</div>
<input
  type="text"
  placeholder="Buscar gimnasio por nombre, propietario o email..."
  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
</div>

<select 
className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
value={statusFilter}
onChange={(e) => setStatusFilter(e.target.value as GymStatus)}
>
<option value="all">Todos los estados</option>
<option value="active">Activos</option>
<option value="trial">En prueba</option>
<option value="suspended">Suspendidos</option>
<option value="expired">Expirados</option>
</select>

<select 
className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
value={dateFilter}
onChange={(e) => setDateFilter(e.target.value as DateRange)}
>
<option value="all">Cualquier fecha</option>
<option value="7days">Últimos 7 días</option>
<option value="30days">Últimos 30 días</option>
<option value="90days">Últimos 90 días</option>
<option value="year">Último año</option>
</select>
</div>
</div>

<div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
<tr>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gimnasio</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
</tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
{loading ? (
  <tr>
    <td colSpan={8} className="px-6 py-4 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    </td>
  </tr>
) : filteredGyms.length === 0 ? (
  <tr>
    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
      No se encontraron gimnasios que coincidan con los filtros.
    </td>
  </tr>
) : (
  filteredGyms.map((gym) => (
    <tr key={gym.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap font-medium">{gym.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{gym.owner}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>{gym.email}</div>
        <div className="text-sm text-gray-500">{gym.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{gym.registrationDate ? formatDate(gym.registrationDate) : '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(gym.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {gym.status === 'active' ? (gym.subscriptionData?.plan || '-') : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {gym.status === 'active' 
          ? formatDate(gym.subscriptionData?.endDate)
          : gym.status === 'trial' 
            ? formatDate(gym.trialEndsAt)
            : '-'
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
            onClick={() => handleAssignSubscription(gym)}
          >
            {gym.status === 'active' ? 'Renovar' : gym.status === 'trial' ? 'Asignar Plan' : 'Reactivar'}
          </button>
          
          {gym.status === 'active' ? (
            <button 
              className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
              onClick={() => handleToggleGymStatus(gym, false)}
            >
              Suspender
            </button>
          ) : gym.status === 'suspended' ? (
            <button 
              className="px-3 py-1 border border-green-300 text-green-600 rounded-md text-sm hover:bg-green-50"
              onClick={() => handleToggleGymStatus(gym, true)}
            >
              Activar
            </button>
          ) : null}
          
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            <BarChart2 className="inline mr-1" size={16} />
            Estadísticas
          </button>
        </div>
      </td>
    </tr>
  ))
)}
</tbody>
</table>
</div>
</div>

{/* Modal de asignación de suscripción */}
{showModal && selectedGym && (
<GymSubscriptionModal 
gym={selectedGym}
onClose={() => setShowModal(false)}
onSave={handleSaveSubscription}
/>
)}
</div>
);
};

export default SuperAdminPanel;
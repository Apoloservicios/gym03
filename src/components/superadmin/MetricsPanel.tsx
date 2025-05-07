// src/components/superadmin/MetricsPanel.tsx

import React, { useState, useEffect } from 'react';
import { 
  BarChart, LineChart, PieChart, CreditCard, Calendar, Users, 
  ArrowUp, ArrowDown, RefreshCw, Filter, ChevronDown 
} from 'lucide-react';
import { getSubscriptionStats, getPaymentHistory } from '../../services/superadmin.service';
import { formatCurrency } from '../../utils/formatting.utils';
import SuperAdminHeader from './SuperAdminHeader';
import RevenueChart from './charts/RevenueChart';
import GymsChart from './charts/GymsChart';
import PaymentsTable from './PaymentsTable';

type DateRange = '7days' | '30days' | '90days' | 'year' | 'all';

const MetricsPanel: React.FC = () => {
  const [stats, setStats] = useState<{
    totalRevenue: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    expiringSubscriptions: number;
    newSubscriptions: number;
  } | null>(null);
  
  const [payments, setPayments] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<DateRange>('30days');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadData();
  }, [dateFilter]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar estadísticas
      const statsData = await getSubscriptionStats();
      setStats(statsData);
      
      // Obtener rango de fechas según filtro
      const now = new Date();
      let startDate: Date | undefined;
      
      switch (dateFilter) {
        case '7days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          startDate = undefined;
          break;
      }
      
      // Cargar historial de pagos
      const paymentsData = await getPaymentHistory(undefined, startDate);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading metrics data:', error);
      setError('Error al cargar datos de métricas. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <SuperAdminHeader />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Métricas y Estadísticas</h1>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <select
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateRange)}
          >
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 90 días</option>
            <option value="year">Último año</option>
            <option value="all">Todo el historial</option>
          </select>
          
          <button
            onClick={loadData}
            className="px-3 py-2 border rounded-md hover:bg-gray-50"
            title="Actualizar datos"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {loading && !stats ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ingresos Mensuales</p>
                  <h2 className="text-2xl font-bold mt-2">{formatCurrency(stats?.monthlyRevenue || 0)}</h2>
                </div>
                <div className="text-2xl p-3 rounded-full bg-green-100 text-green-600">
                  <CreditCard size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ingresos Totales</p>
                  <h2 className="text-2xl font-bold mt-2">{formatCurrency(stats?.totalRevenue || 0)}</h2>
                </div>
                <div className="text-2xl p-3 rounded-full bg-blue-100 text-blue-600">
                  <BarChart size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Suscripciones Activas</p>
                  <h2 className="text-2xl font-bold mt-2">{stats?.activeSubscriptions || 0}</h2>
                  <p className="text-xs text-green-600 mt-1">
                    <ArrowUp size={12} className="inline mr-1" />
                    {stats?.newSubscriptions || 0} nuevas este mes
                  </p>
                </div>
                <div className="text-2xl p-3 rounded-full bg-purple-100 text-purple-600">
                  <Users size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Próximos Vencimientos</p>
                  <h2 className="text-2xl font-bold mt-2">{stats?.expiringSubscriptions || 0}</h2>
                  <p className="text-xs text-yellow-600 mt-1">
                    <Calendar size={12} className="inline mr-1" />
                    Próximos 30 días
                  </p>
                </div>
                <div className="text-2xl p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Calendar size={20} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Evolución de Ingresos</h2>
              <div className="h-64">
                <RevenueChart dateRange={dateFilter} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Evolución de Gimnasios</h2>
              <div className="h-64">
                <GymsChart dateRange={dateFilter} />
              </div>
            </div>
          </div>
          
          {/* Tabla de pagos recientes */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Historial de Pagos</h2>
            </div>
            
            <PaymentsTable payments={payments} />
          </div>
        </>
      )}
    </div>
  );
};

export default MetricsPanel;
// src/pages/reports/Reports.tsx
import React, { useState } from 'react';
import CashierReports from '../../components/reports/CashierReports';
import { FileText, DollarSign, Users, Calendar } from 'lucide-react';

// Nota: En un implementación real, tendrías múltiples componentes de informes
// como informes de asistencia, informes de membresías, etc.

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cash');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Informes</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('cash')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'cash'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Caja Diaria
            </button>
            
            {/* Aquí irían otras pestañas para diferentes tipos de informes */}
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Asistencias
            </button>
            
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Socios
            </button>
            
            <button
              onClick={() => setActiveTab('memberships')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'memberships'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Membresías
            </button>
          </nav>
        </div>
      </div>

      <div>
        {activeTab === 'cash' ? (
          <CashierReports />
        ) : (
          <div className="bg-white p-12 text-center rounded-lg shadow-md">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'attendance' ? (
                <Calendar className="h-8 w-8" />
              ) : activeTab === 'members' ? (
                <Users className="h-8 w-8" />
              ) : (
                <FileText className="h-8 w-8" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">Informe en Desarrollo</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Los informes de {activeTab === 'attendance' ? 'asistencias' : 
                              activeTab === 'members' ? 'socios' : 
                              'membresías'} están en desarrollo y estarán disponibles próximamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
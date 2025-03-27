// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ClipboardCheck, Dumbbell, Bell } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>
        <div className="text-2xl p-3 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  // Datos de ejemplo para los gráficos
  const memberData = [
    { name: '01/03', value: 1 },
    { name: '07/03', value: 2 },
    { name: '14/03', value: 3 },
    { name: '21/03', value: 4 },
  ];
  
  const incomeData = [
    { name: '01/03', value: 5000 },
    { name: '07/03', value: 12000 },
    { name: '14/03', value: 8000 },
    { name: '21/03', value: 15000 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Socios Registrados" 
          value="42" 
          icon={<Users size={20} />} 
          color="#4F46E5" 
        />
        <DashboardCard 
          title="Asistencias" 
          value="128" 
          icon={<ClipboardCheck size={20} />} 
          color="#10B981" 
        />
        <DashboardCard 
          title="Rutinas" 
          value="15" 
          icon={<Dumbbell size={20} />} 
          color="#F59E0B" 
        />
        <DashboardCard 
          title="Notificaciones" 
          value="3" 
          icon={<Bell size={20} />} 
          color="#EF4444" 
        />
      </div>
      
      {/* Alertas importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Próximos Cumpleaños (30 días)</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-md">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-semibold">MR</div>
              <div className="ml-4">
                <p className="font-medium">María Rodríguez</p>
                <p className="text-sm text-gray-500">25 de Marzo (en 4 días)</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-md">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-semibold">CL</div>
              <div className="ml-4">
                <p className="font-medium">Carlos López</p>
                <p className="text-sm text-gray-500">2 de Abril (en 12 días)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Membresías Próximas a Vencer (15 días)</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-yellow-50 rounded-md">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 font-semibold">JF</div>
              <div className="ml-4 flex-1">
                <p className="font-medium">Juan Fran</p>
                <p className="text-sm text-gray-500">Musculación - Vence 29/03</p>
              </div>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">Renovar</button>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-md">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 font-semibold">AG</div>
              <div className="ml-4 flex-1">
                <p className="font-medium">Ana García</p>
                <p className="text-sm text-gray-500">Pilates - Vence 04/04</p>
              </div>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">Renovar</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Evolución de Socios</h3>
            <select className="border rounded-md p-1 text-sm">
              <option>Último Mes</option>
              <option>Últimos 3 Meses</option>
              <option>Último Año</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Evolución de Ingresos</h3>
            <select className="border rounded-md p-1 text-sm">
              <option>Último Mes</option>
              <option>Últimos 3 Meses</option>
              <option>Último Año</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value}`, 'Ingresos']} />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
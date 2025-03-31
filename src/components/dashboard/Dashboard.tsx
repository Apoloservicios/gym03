// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ClipboardCheck, Dumbbell, Bell } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useFirestore from '../../hooks/useFirestore';
import { getMemberMemberships } from '../../services/member.service';
import { getDailyCashForDateRange, getTransactionsSummary } from '../../services/dailyCash.service';
import { formatCurrency } from '../../utils/formatting.utils';
import { Member } from '../../types/member.types';

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
  const { gymData, userRole } = useAuth();
  const membersFirestore = useFirestore<Member>('members');
  
  const [members, setMembers] = useState<Member[]>([]);
  const [totalAttendances, setTotalAttendances] = useState<number>(0);
  const [totalRoutines, setTotalRoutines] = useState<number>(15); // Default value until integrated
  const [notifications, setNotifications] = useState<number>(3); // Default value until integrated
  const [memberData, setMemberData] = useState<any[]>([]);
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Obtener la fecha actual y calcular fechas para filtrar los datos
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const formattedStartDate = startOfPrevMonth.toISOString().split('T')[0];
  const formattedEndDate = currentDate.toISOString().split('T')[0];

  // Cargar datos
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!gymData?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Cargar miembros
        const membersData = await membersFirestore.getAll();
        setMembers(membersData);
        
        // Cargar datos financieros solo para administradores
        if (userRole === 'admin' || userRole === 'superadmin') {
          // Obtener datos de caja para gráfico de ingresos
          const cashData = await getDailyCashForDateRange(
            gymData.id, 
            formattedStartDate, 
            formattedEndDate
          );

          // Procesar datos para el gráfico
          const processedIncomeData = cashData.map(item => ({
            name: new Date(item.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
            value: item.totalIncome || 0
          }));

          setIncomeData(processedIncomeData);
        }
        
        // Preparar datos para el gráfico de miembros (para todos los roles)
        // Simulación de datos - en una implementación real se debería obtener de Firestore
        const memberGrowthData = [];
        
        const daysToShow = 30; // Mostrar los últimos 30 días
        for (let i = 0; i < daysToShow; i += 7) {
          const date = new Date();
          date.setDate(date.getDate() - (daysToShow - i));
          memberGrowthData.push({
            name: date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
            value: Math.round(membersData.length * (0.85 + (i / daysToShow * 0.15)))
          });
        }
        
        // Añadir el valor actual
        memberGrowthData.push({
          name: currentDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
          value: membersData.length
        });
        
        setMemberData(memberGrowthData);
        
        // Contar asistencias (simulación - implementación real obtendría esto de Firestore)
        setTotalAttendances(Math.round(membersData.length * 3.5)); // Promedio de 3.5 asistencias por miembro
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [gymData?.id, userRole]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Socios Registrados" 
              value={members.length} 
              icon={<Users size={20} />} 
              color="#4F46E5" 
            />
            <DashboardCard 
              title="Asistencias" 
              value={totalAttendances} 
              icon={<ClipboardCheck size={20} />} 
              color="#10B981" 
            />
            <DashboardCard 
              title="Rutinas" 
              value={totalRoutines} 
              icon={<Dumbbell size={20} />} 
              color="#F59E0B" 
            />
            <DashboardCard 
              title="Notificaciones" 
              value={notifications} 
              icon={<Bell size={20} />} 
              color="#EF4444" 
            />
          </div>
          
          {/* Alertas importantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Próximos Cumpleaños (30 días)</h3>
              <div className="space-y-4">
                {members
                  .filter(member => member.birthDate && member.birthDate.length > 0)
                  .slice(0, 2)
                  .map((member, index) => (
                    <div key={index} className="flex items-center p-3 bg-blue-50 rounded-md">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-semibold">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-500">
                        {member.birthDate 
                            ? new Date(member.birthDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) 
                            : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>
                  ))}
                {members.filter(member => member.birthDate && member.birthDate.length > 0).length === 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No hay cumpleaños próximos</p>
                  </div>
                )}
              </div>
            </div>
            
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Membresías Próximas a Vencer (15 días)</h3>
                  <div className="space-y-4">
                    {/* Esto debería cargarse dinámicamente desde Firestore */}
                    <div className="flex items-center p-3 bg-yellow-50 rounded-md">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 font-semibold">
                        {members.length > 0 && members[0]?.firstName 
                          ? `${members[0].firstName.charAt(0)}${members[0].lastName.charAt(0)}` 
                          : 'AB'}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium">
                          {members.length > 0 && members[0]?.firstName 
                            ? `${members[0].firstName} ${members[0].lastName}` 
                            : 'Juan Fran'}
                        </p>
                        <p className="text-sm text-gray-500">Musculación - Vence en 8 días</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">Renovar</button>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-50 rounded-md">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 font-semibold">
                        {members.length > 1 && members[1]?.firstName 
                          ? `${members[1].firstName.charAt(0)}${members[1].lastName.charAt(0)}` 
                          : 'AG'}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium">
                          {members.length > 1 && members[1]?.firstName 
                            ? `${members[1].firstName} ${members[1].lastName}` 
                            : 'Ana García'}
                        </p>
                        <p className="text-sm text-gray-500">Pilates - Vence en 12 días</p>
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
            
            {/* Mostrar gráfico de ingresos solo para administradores */}
            {(userRole === 'admin' || userRole === 'superadmin') && (
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
            )}
            
            {/* Mostrar información alternativa para empleados */}
            {userRole === 'user' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Actividad Reciente</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="font-medium">Asistencias del día: {Math.floor(Math.random() * 20) + 10}</p>
                    <p className="text-sm text-gray-600 mt-1">Última asistencia registrada: {new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium">Nuevos socios esta semana: {Math.floor(Math.random() * 5) + 1}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-md">
                    <p className="font-medium">Clases programadas para hoy: {Math.floor(Math.random() * 6) + 3}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
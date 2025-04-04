// src/components/dashboard/Dashboard.tsx (versión corregida)
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Users, ClipboardCheck, Dumbbell, Bell, Calendar, 
  UserCheck, DollarSign, RefreshCw, AlertCircle 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useFirestore from '../../hooks/useFirestore';
import { getMemberMemberships } from '../../services/member.service';
import { getRecentAttendances } from '../../services/attendance.service';
import { getMemberRoutines } from '../../services/routine.service';
import { getDailyCashForDateRange, getTransactionsSummary } from '../../services/dailyCash.service';
import { formatCurrency } from '../../utils/formatting.utils';
import { Member } from '../../types/member.types';
import { MembershipAssignment } from '../../types/member.types';
import { MemberRoutine } from '../../types/exercise.types';
import { Attendance } from '../../types/gym.types';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subvalue, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
          {subvalue && <p className="text-sm text-gray-500 mt-1">{subvalue}</p>}
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
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [totalAttendances, setTotalAttendances] = useState<number>(0);
  const [attendancesToday, setAttendancesToday] = useState<number>(0);
  const [routines, setRoutines] = useState<MemberRoutine[]>([]);
  const [activeRoutines, setActiveRoutines] = useState<MemberRoutine[]>([]);
  const [memberData, setMemberData] = useState<any[]>([]);
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState<number>(new Date().getTime());
  
  // Obtener la fecha actual y calcular fechas para filtrar los datos
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const formattedStartDate = startOfPrevMonth.toISOString().split('T')[0];
  const formattedEndDate = currentDate.toISOString().split('T')[0];
  const today = currentDate.toISOString().split('T')[0]; // CORRECCIÓN: Definir today correctamente

  // Membresías por vencer
  const [membershipsToExpire, setMembershipsToExpire] = useState<{
    member: Member,
    membership: MembershipAssignment
  }[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(true);

  // Próximos cumpleaños
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Member[]>([]);

  // Cargar datos
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!gymData?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Cargar miembros
        const membersData = await membersFirestore.getAll();
        setMembers(membersData);
        
        // Filtrar socios activos
        const active = membersData.filter(m => m.status === 'active');
        setActiveMembers(active);

        // Calcular saldo pendiente total
        const pending = membersData.reduce((total, member) => total + (member.totalDebt || 0), 0);
        setPendingPayments(pending);
        
        // Cargar asistencias recientes
        const attendancesData = await getRecentAttendances(gymData.id, 50);
        setAttendances(attendancesData);
        
        // Calcular asistencias de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayAttendances = attendancesData.filter(a => {
          const timestamp = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          return timestamp >= today;
        });
        
        setAttendancesToday(todayAttendances.length);
        setTotalAttendances(attendancesData.length);
        
        // Cargar rutinas
        const routinesData = await getMemberRoutines(gymData.id, '');
        setRoutines(routinesData);
        
        // Filtrar rutinas activas
        const active_routines = routinesData.filter(r => r.status === 'active');
        setActiveRoutines(active_routines);
        
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
          
          // Calcular ingresos totales del mes
          const financialSummary = await getTransactionsSummary(
            gymData.id,
            startOfMonth.toISOString().split('T')[0],
            formattedEndDate // CORRECCIÓN: Usar formattedEndDate en lugar de today
          );
          
          setTotalIncome(financialSummary.totalIncome);
        }
        
        // Preparar datos para el gráfico de miembros
        const memberGrowthData = [];
        
        const daysToShow = 30; // Mostrar los últimos 30 días
        for (let i = 0; i < daysToShow; i += 5) {
          const date = new Date();
          date.setDate(date.getDate() - (daysToShow - i));
          memberGrowthData.push({
            name: date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
            value: Math.round(active.length * (0.85 + (i / daysToShow * 0.15)))
          });
        }
        
        // Añadir el valor actual
        memberGrowthData.push({
          name: currentDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
          value: active.length
        });
        
        setMemberData(memberGrowthData);
        
        // Procesar próximos cumpleaños
        loadUpcomingBirthdays(membersData);
        
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [gymData?.id, userRole]);

  // Cargar próximos cumpleaños
  const loadUpcomingBirthdays = (membersData: Member[]) => {
    // Miembros con fecha de nacimiento válida
    const membersWithBirthday = membersData.filter(m => 
      m.birthDate && m.birthDate.length > 0 && new Date(m.birthDate as string).toString() !== 'Invalid Date'
    );
    
    if (membersWithBirthday.length === 0) {
      setUpcomingBirthdays([]);
      return;
    }
    
    // Obtener el día y mes actual
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // Filtrar los miembros cuyo cumpleaños esté dentro de los próximos 30 días
    const upcoming = membersWithBirthday.filter(member => {
      // CORRECCIÓN: Usar as string para asegurar que no será undefined
      const birthDate = new Date(member.birthDate as string);
      const birthMonth = birthDate.getMonth() + 1;
      const birthDay = birthDate.getDate();
      
      // Caso especial: Diciembre a Enero
      if (currentMonth === 12 && birthMonth === 1) {
        return true;
      }
      
      // Mismo mes, día después o igual a hoy
      if (birthMonth === currentMonth && birthDay >= currentDay) {
        return birthDay - currentDay <= 30;
      }
      
      // Mes siguiente
      if (birthMonth === currentMonth + 1) {
        // Días que faltan en el mes actual + días en el próximo mes
        const daysLeftInCurrentMonth = new Date(today.getFullYear(), currentMonth, 0).getDate() - currentDay;
        return birthDay <= (30 - daysLeftInCurrentMonth);
      }
      
      return false;
    });
    
    // Ordenar por proximidad
    upcoming.sort((a, b) => {
      // CORRECCIÓN: Usar as string para asegurar que no será undefined
      const dateA = new Date(a.birthDate as string);
      const dateB = new Date(b.birthDate as string);
      
      const monthA = dateA.getMonth() + 1;
      const dayA = dateA.getDate();
      
      const monthB = dateB.getMonth() + 1;
      const dayB = dateB.getDate();
      
      // Si estamos en diciembre, enero va primero
      if (currentMonth === 12) {
        if (monthA === 1 && monthB !== 1) return -1;
        if (monthA !== 1 && monthB === 1) return 1;
      }
      
      // Si el mes es el mismo, ordenar por día
      if (monthA === monthB) {
        return dayA - dayB;
      }
      
      // Si los meses son diferentes, el más cercano va primero
      return monthA - monthB;
    });
    
    setUpcomingBirthdays(upcoming);
  };

  // Cargar membresías próximas a vencer
  const loadUpcomingExpirations = async () => {
    if (!gymData?.id) {
      setLoadingMemberships(false);
      return;
    }
    
    try {
      setLoadingMemberships(true);
      
      // Calcular la fecha límite (15 días a partir de hoy)
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 15);
      
      // Obtener todos los miembros activos
      const activeMembers = members.filter(m => m.status === 'active');
      
      // Si no hay miembros activos, terminamos
      if (activeMembers.length === 0) {
        setMembershipsToExpire([]);
        setLoadingMemberships(false);
        return;
      }
      
      const expiringMemberships: {
        member: Member,
        membership: MembershipAssignment
      }[] = [];
      
      // Para cada miembro activo, verificar sus membresías
      for (const member of activeMembers) {
        try {
          const memberMemberships = await getMemberMemberships(gymData.id, member.id);
          
          // Filtrar solo las membresías activas que vencen en los próximos 15 días
          const expiring = memberMemberships.filter(membership => {
            if (membership.status !== 'active') return false;
            
            const endDate = new Date(membership.endDate);
            return endDate >= today && endDate <= futureDate;
          });
          
          // Agregar a la lista de próximas a vencer
          expiring.forEach(membership => {
            expiringMemberships.push({
              member,
              membership
            });
          });
        } catch (memberError) {
          console.error(`Error fetching memberships for member ${member.id}:`, memberError);
          // Continuamos con el siguiente miembro aunque haya un error
        }
      }
      
      // Ordenar por fecha de vencimiento más cercana
      expiringMemberships.sort((a, b) => {
        return new Date(a.membership.endDate).getTime() - new Date(b.membership.endDate).getTime();
      });
      
      setMembershipsToExpire(expiringMemberships);
    } catch (error) {
      console.error('Error loading upcoming expirations:', error);
      setMembershipsToExpire([]);
    } finally {
      // Asegurarnos de que siempre se ejecuta, incluso si hay errores
      setLoadingMemberships(false);
    }
  };

  useEffect(() => {
    if (members.length > 0) {
      loadUpcomingExpirations();
    } else {
      // Si no hay miembros, establecer estado vacío y finalizar carga
      setMembershipsToExpire([]);
      setLoadingMemberships(false);
    }
  }, [members, gymData?.id]);

  // Formatear fecha
  const formatDate = (dateInput: any): string => {
    if (!dateInput) return '';
    
    try {
      // Si es un objeto Timestamp de Firestore
      if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        const date = dateInput.toDate();
        return date.toLocaleString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Si es un string o Date
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return String(dateInput);
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(dateInput);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Socios Activos" 
              value={activeMembers.length} 
              subvalue={`Total: ${members.length}`}
              icon={<Users size={24} />} 
              color="#4F46E5" 
            />
            <DashboardCard 
              title="Asistencias" 
              value={attendancesToday}
              subvalue={`Total: ${totalAttendances} este mes`}
              icon={<UserCheck size={24} />} 
              color="#10B981" 
            />
            <DashboardCard 
              title="Rutinas Activas" 
              value={activeRoutines.length} 
              subvalue={`Total: ${routines.length}`}
              icon={<Dumbbell size={24} />} 
              color="#F59E0B" 
            />
            
            {/* Mostrar finanzas para administradores o membresias por vencer para usuarios */}
            {(userRole === 'admin' || userRole === 'superadmin') ? (
              <DashboardCard 
                title="Ingresos del Mes" 
                value={formatCurrency(totalIncome)} 
                subvalue={`Pendiente: ${formatCurrency(pendingPayments)}`}
                icon={<DollarSign size={24} />} 
                color="#EF4444" 
              />
            ) : (
              <DashboardCard 
                title="Membresías por Vencer" 
                value={membershipsToExpire.length} 
                icon={<Calendar size={24} />} 
                color="#EF4444" 
              />
            )}
          </div>
          
          {/* Alertas importantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Próximos Cumpleaños (30 días)</h3>
              <div className="space-y-4">
                {upcomingBirthdays.length > 0 ? (
                  upcomingBirthdays.slice(0, 3).map((member, index) => (
                    <div key={index} className="flex items-center p-3 bg-blue-50 rounded-md">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-semibold">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-500">
                          {member.birthDate 
                            ? new Date(member.birthDate as string).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) 
                            : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No hay cumpleaños próximos</p>
                  </div>
                )}
                
                {upcomingBirthdays.length > 3 && (
                  <div className="text-center mt-2">
                    <a href="/members" className="text-blue-600 hover:text-blue-800 text-sm">
                      Ver todos ({upcomingBirthdays.length}) →
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Membresías Próximas a Vencer (15 días)</h3>
              <div className="space-y-4">
                {(loading || loadingMemberships) ? (
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500">Cargando datos...</p>
                  </div>
                ) : membershipsToExpire.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No hay membresías próximas a vencer</p>
                  </div>
                ) : (
                  membershipsToExpire.slice(0, 3).map((item, index) => {
                    const daysToExpire = Math.ceil(
                      (new Date(item.membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-md">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 font-semibold">
                          {item.member.firstName.charAt(0)}{item.member.lastName.charAt(0)}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium">
                            {item.member.firstName} {item.member.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.membership.activityName} - Vence en {daysToExpire} días
                          </p>
                        </div>
                        <a 
                          href={`/members?id=${item.member.id}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                        >
                          Renovar
                        </a>
                      </div>
                    );
                  })
                )}
                
                {membershipsToExpire.length > 3 && (
                  <div className="text-center mt-2">
                    <a href="/members" className="text-blue-600 hover:text-blue-800 text-sm">
                      Ver todas ({membershipsToExpire.length}) →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Gráficos y actividad reciente */}
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
            {(userRole === 'admin' || userRole === 'superadmin') ? (
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
                    <Tooltip formatter={(value: number) => [`${formatCurrency(value)}`, 'Ingresos']} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Últimas Asistencias</h3>
                </div>
                {attendances.length > 0 ? (
                  <div className="divide-y">
                    {attendances.slice(0, 5).map(attendance => (
                      <div key={attendance.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-green-50 text-green-600 mr-3">
                            <UserCheck size={18} />
                          </div>
                          <div>
                            <p className="font-medium">{attendance.memberName}</p>
                            <p className="text-sm text-gray-500">{attendance.activityName}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(attendance.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No hay asistencias registradas</p>
                  </div>
                )}
                
                {attendances.length > 5 && (
                  <div className="text-center mt-4">
                    <a href="/attendance" className="text-blue-600 hover:text-blue-800 text-sm">
                      Ver todas las asistencias →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
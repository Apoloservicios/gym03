// src/components/members/MemberDetail.tsx

import React, { useState } from 'react';
import { Mail, Phone, Calendar, MapPin, Edit, Trash, QrCode, CreditCard, Plus, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Member } from '../../types/member.types';
import { formatCurrency } from '../../utils/formatting.utils';

interface MemberDetailProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onGenerateQr: (member: Member) => void;
  onAssignMembership: (member: Member) => void;
}

const MemberDetail: React.FC<MemberDetailProps> = ({ 
  member, 
  onEdit, 
  onDelete, 
  onGenerateQr, 
  onAssignMembership 
}) => {
  const [showAllMemberships, setShowAllMemberships] = useState(false);
  
  // En un caso real, esta información vendría de la base de datos
  const memberships = [
    {
      id: 'mem1',
      activityName: 'Musculación',
      startDate: '2025-03-01',
      endDate: '2025-04-01',
      status: 'active',
      paymentStatus: 'paid',
      cost: 10000,
      maxAttendances: 30,
      currentAttendances: 12
    },
    {
      id: 'mem2',
      activityName: 'Yoga',
      startDate: '2025-02-15',
      endDate: '2025-03-15',
      status: 'expired',
      paymentStatus: 'paid',
      cost: 9000,
      maxAttendances: 8,
      currentAttendances: 8
    },
    {
      id: 'mem3',
      activityName: 'Pilates',
      startDate: '2025-01-10',
      endDate: '2025-02-10',
      status: 'expired',
      paymentStatus: 'paid',
      cost: 14000,
      maxAttendances: 8,
      currentAttendances: 6
    }
  ];
  
  // Mostrar solo las membresías activas o todas según estado
  const visibleMemberships = showAllMemberships 
    ? memberships 
    : memberships.filter(m => m.status === 'active');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };
  
  // Color según estado de la membresía
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Color según estado de pago
  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calcular porcentaje de asistencias
  const calculateAttendancePercentage = (current: number, max: number) => {
    if (!max) return 0;
    return Math.round((current / max) * 100);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cabecera con información básica */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            {member.photo ? (
              <img 
                src={member.photo} 
                alt={`${member.firstName} ${member.lastName}`} 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="text-blue-600 font-medium text-xl">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {member.firstName} {member.lastName}
                </h1>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                  
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.totalDebt > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {member.totalDebt > 0 ? 'Con deuda' : 'Sin deuda'}
                  </span>
                </div>
              </div>
              
              <div className="flex mt-4 md:mt-0 space-x-2">
                <button 
                  onClick={() => onEdit(member)}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit size={16} className="mr-1" />
                  Editar
                </button>
                <button 
                  onClick={() => onDelete(member.id)}
                  className="px-3 py-1 border border-gray-300 rounded text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash size={16} className="mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div className="flex items-center">
                <Mail size={16} className="text-gray-400 mr-2" />
                <span>{member.email || 'No disponible'}</span>
              </div>
              
              <div className="flex items-center">
                <Phone size={16} className="text-gray-400 mr-2" />
                <span>{member.phone || 'No disponible'}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin size={16} className="text-gray-400 mr-2" />
                <span>{member.address || 'No disponible'}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-2" />
                <span>{member.birthDate ? formatDate(member.birthDate) : 'No disponible'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección de acciones rápidas */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap">
          <button 
            onClick={() => onGenerateQr(member)}
            className="flex-1 text-center py-3 px-4 text-sm font-medium hover:bg-gray-100 flex items-center justify-center"
          >
            <QrCode size={18} className="mr-2 text-blue-600" />
            Generar QR
          </button>
          
          <button 
            onClick={() => onAssignMembership(member)}
            className="flex-1 text-center py-3 px-4 text-sm font-medium hover:bg-gray-100 flex items-center justify-center"
          >
            <Plus size={18} className="mr-2 text-green-600" />
            Asignar Membresía
          </button>
          
          <button 
            className="flex-1 text-center py-3 px-4 text-sm font-medium hover:bg-gray-100 flex items-center justify-center"
          >
            <CreditCard size={18} className="mr-2 text-purple-600" />
            Registrar Pago
          </button>
        </div>
      </div>
      
      {/* Sección de membresías */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Membresías</h2>
          
          <button 
            onClick={() => setShowAllMemberships(!showAllMemberships)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showAllMemberships ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Mostrar activas
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Mostrar todas
              </>
            )}
          </button>
        </div>
        
        {visibleMemberships.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <CreditCard size={24} className="text-gray-400" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">No hay membresías activas</h3>
            <button 
              onClick={() => onAssignMembership(member)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Asignar Nueva Membresía
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleMemberships.map((membership) => (
              <div key={membership.id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="font-medium">{membership.activityName}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(membership.status)}`}>
                        {membership.status === 'active' ? 'Activa' : 'Vencida'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusStyles(membership.paymentStatus)}`}>
                        {membership.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 sm:mt-0">
                    <div className="text-sm text-gray-600 mr-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(membership.startDate)} - {formatDate(membership.endDate)}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <DollarSign size={14} className="mr-1" />
                        <span>{formatCurrency(membership.cost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Asistencias: {membership.currentAttendances} de {membership.maxAttendances}</span>
                    <span>{calculateAttendancePercentage(membership.currentAttendances, membership.maxAttendances)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${calculateAttendancePercentage(membership.currentAttendances, membership.maxAttendances)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;
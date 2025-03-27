// src/components/members/MemberList.tsx

import React, { useState } from 'react';
import { Search, User, Edit, Trash, Eye, CreditCard, BanknoteIcon } from 'lucide-react';
import { Member } from '../../types/member.types';

interface MemberListProps {
  onNewMember: () => void;
  onViewMember: (member: Member) => void;
}

const MemberList: React.FC<MemberListProps> = ({ onNewMember, onViewMember }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Datos de ejemplo
  const members: Member[] = [
    {
      id: '1',
      firstName: 'Juan',
      lastName: 'Fran',
      email: 'franc@gmail.com',
      phone: '234555',
      status: 'active',
      totalDebt: 0,
      lastAttendance: '21/03/2025',
      photo: null
    },
    {
      id: '2',
      firstName: 'María',
      lastName: 'González',
      email: 'maria@gmail.com',
      phone: '234777',
      status: 'active',
      totalDebt: 15000,
      lastAttendance: '20/03/2025',
      photo: null
    },
    {
      id: '3',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos@gmail.com',
      phone: '234888',
      status: 'inactive',
      totalDebt: 0,
      lastAttendance: '10/02/2025',
      photo: null
    }
  ];
  
  // Filtrar miembros según la búsqueda
  const filteredMembers = members.filter(member => 
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Lista de Socios</h1>
        <button 
          onClick={onNewMember}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          <User className="mr-2" size={20} />
          Nuevo Socio
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Barra de búsqueda y filtros */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar socio por nombre, apellido o email..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            
            <select className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            
            <select className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Estado de deuda</option>
              <option value="with_debt">Con deuda</option>
              <option value="no_debt">Sin deuda</option>
            </select>
          </div>
        </div>
        
        {/* Tabla de socios */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Asistencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deuda Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.photo ? (
                      <img src={member.photo} alt={`${member.firstName} ${member.lastName}`} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.lastAttendance}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={member.totalDebt > 0 ? 'text-red-600 font-medium' : ''}>
                      ${member.totalDebt.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800" 
                      title="Ver detalles"
                      onClick={() => onViewMember(member)}
                    >
                      <Eye size={18} />
                    </button>
                    <button className="text-green-600 hover:text-green-800" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-800" title="Eliminar">
                      <Trash size={18} />
                    </button>
                    <button className="text-purple-600 hover:text-purple-800" title="Generar QR">
                      <CreditCard size={18} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-800" title="Registrar pago">
                      <BanknoteIcon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="px-6 py-3 flex items-center justify-between border-t">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredMembers.length}</span> de <span className="font-medium">{members.length}</span> resultados
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-md text-sm disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">1</button>
            <button className="px-3 py-1 border rounded-md text-sm">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
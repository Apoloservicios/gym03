// src/pages/members/Members.tsx

import React, { useState, useEffect } from 'react';
import MemberList from '../../components/members/MemberList';
import MemberForm from '../../components/members/MemberForm';
import MemberDetail from '../../components/members/MemberDetail';
import MemberQR from '../../components/members/MemberQR';
import MemberPayment from '../../components/members/MemberPayment';
import MembershipForm from '../../components/memberships/MembershipForm';
import { Member } from '../../types/member.types';
import useFirestore from '../../hooks/useFirestore';
import useAuth from '../../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

type ViewType = 'list' | 'form' | 'detail' | 'qr' | 'membership' | 'payment';

const Members: React.FC = () => {
  const { gymData } = useAuth();
  const membersFirestore = useFirestore<Member>('members');
  
  const [view, setView] = useState<ViewType>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Funciones para manejar navegación entre componentes
  const handleNewMember = () => {
    setIsEdit(false);
    setSelectedMember(null);
    setView('form');
  };
  
  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsEdit(true);
    setView('form');
  };
  
  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setView('detail');
  };
  
  const handleGenerateQR = (member: Member) => {
    setSelectedMember(member);
    setView('qr');
  };
  
  const handleAssignMembership = (member: Member) => {
    setSelectedMember(member);
    setView('membership');
  };
  
  const handleRegisterPayment = (member: Member) => {
    setSelectedMember(member);
    setView('payment');
  };
  
  // Manejar eliminación de socio
  const handleDeleteMember = async (memberId: string) => {
    if (!gymData?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await membersFirestore.remove(memberId);
      
      if (result) {
        // Si eliminamos el socio que estamos viendo, volver a la lista
        if (selectedMember?.id === memberId) {
          setSelectedMember(null);
          setView('list');
        }
      } else {
        throw new Error('No se pudo eliminar el socio');
      }
    } catch (err: any) {
      console.error('Error deleting member:', err);
      setError(err.message || 'Error al eliminar el socio');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar guardado de socio (nuevo o editado)
  const handleSaveMember = async (formData: any) => {
    if (!gymData?.id) return;
    
    setLoading(true);
    
    try {
      if (isEdit && selectedMember) {
        // Actualizar socio existente
        const result = await membersFirestore.update(selectedMember.id, formData);
        
        if (result) {
          // Actualizar selectedMember con los nuevos datos
          const updatedMember = await membersFirestore.getById(selectedMember.id);
          if (updatedMember) {
            setSelectedMember(updatedMember);
            setView('detail');
          } else {
            setSelectedMember(null);
            setView('list');
          }
        }
      } else {
        // Crear nuevo socio
        const newMember = await membersFirestore.add(formData);
        
        if (newMember) {
          setSelectedMember(newMember);
          setView('detail');
        }
      }
    } catch (err: any) {
      console.error('Error saving member:', err);
      setError(err.message || 'Error al guardar el socio');
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizado condicional según la vista actual
  const renderView = () => {
    switch (view) {
      case 'form':
        return (
          <MemberForm 
            isEdit={isEdit}
            initialData={selectedMember}
            onSave={handleSaveMember}
            onCancel={() => setView(selectedMember ? 'detail' : 'list')}
          />
        );
      case 'detail':
        if (!selectedMember) return null;
        return (
          <div className="space-y-6">
            <MemberDetail 
              member={selectedMember}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onGenerateQr={handleGenerateQR}
              onAssignMembership={handleAssignMembership}
            />
          </div>
        );
      case 'qr':
        if (!selectedMember) return null;
        return (
          <MemberQR 
            member={selectedMember}
          />
        );
      case 'payment':
        if (!selectedMember) return null;
        return (
          <MemberPayment 
            member={selectedMember}
            onSuccess={() => {
              // Recargar los datos del socio después del pago
              const reloadMember = async () => {
                if (!gymData?.id) return;
                
                try {
                  const updatedMember = await membersFirestore.getById(selectedMember.id);
                  if (updatedMember) {
                    setSelectedMember(updatedMember);
                  }
                } catch (err) {
                  console.error('Error reloading member:', err);
                }
              };
              
              reloadMember();
              setView('detail');
            }}
            onCancel={() => setView('detail')}
          />
        );
      case 'membership':
        if (!selectedMember) return null;
        return (
          <MembershipForm 
            memberId={selectedMember.id}
            memberName={`${selectedMember.firstName} ${selectedMember.lastName}`}
            onSave={() => {
              // Recargar los datos del socio después de asignar membresía
              const reloadMember = async () => {
                if (!gymData?.id) return;
                
                try {
                  const updatedMember = await membersFirestore.getById(selectedMember.id);
                  if (updatedMember) {
                    setSelectedMember(updatedMember);
                  }
                } catch (err) {
                  console.error('Error reloading member:', err);
                }
              };
              
              reloadMember();
              setView('detail');
            }}
            onCancel={() => setView('detail')}
          />
        );
      case 'list':
      default:
        return (
          <MemberList 
            onNewMember={handleNewMember}
            onViewMember={handleViewMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onGenerateQr={handleGenerateQR}
            onRegisterPayment={handleRegisterPayment}
          />
        );
    }
  };
  
  return (
    <div className="p-6">
      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Cabecera de navegación */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {view === 'list' && 'Socios'}
          {view === 'form' && (isEdit ? 'Editar Socio' : 'Nuevo Socio')}
          {view === 'detail' && 'Detalle de Socio'}
          {view === 'qr' && 'Código QR'}
          {view === 'membership' && 'Asignar Membresía'}
          {view === 'payment' && 'Registrar Pago'}
        </h1>
        
        {/* Migas de pan para navegación */}
        {view !== 'list' && (
          <nav className="text-sm text-blue-600 mt-1">
            <button onClick={() => setView('list')}>Socios</button>
            {view !== 'form' && selectedMember && (
              <>
                <span className="mx-2">/</span>
                <button onClick={() => setView('detail')}>
                  {selectedMember.firstName} {selectedMember.lastName}
                </button>
              </>
            )}
          </nav>
        )}
      </div>
      
      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500">Cargando...</span>
        </div>
      ) : (
        renderView()
      )}
    </div>
  );
};

export default Members;
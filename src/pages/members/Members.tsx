// src/pages/members/Members.tsx

import React, { useState } from 'react';
import MemberList from '../../components/members/MemberList';
import MemberForm from '../../components/members/MemberForm';
import MemberDetail from '../../components/members/MemberDetail';
import MemberQR from '../../components/members/MemberQR';
import MembershipForm from '../../components/memberships/MembershipForm';
import { Member } from '../../types/member.types';

type ViewType = 'list' | 'form' | 'detail' | 'qr' | 'membership';

const Members: React.FC = () => {
  const [view, setView] = useState<ViewType>('list');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  
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
  
  // Renderizado condicional según la vista actual
  const renderView = () => {
    switch (view) {
      case 'form':
        return (
          <MemberForm 
            isEdit={isEdit}
            initialData={selectedMember}
            onSave={() => {
              // Lógica para guardar
              setView('list');
            }}
            onCancel={() => setView('list')}
          />
        );
      case 'detail':
        if (!selectedMember) return null;
        return (
          <div className="space-y-6">
            <MemberDetail 
              member={selectedMember}
              onEdit={handleEditMember}
              onDelete={(id) => {
                // Lógica para eliminar
                setView('list');
              }}
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
      case 'membership':
        if (!selectedMember) return null;
        return (
          <MembershipForm 
            memberId={selectedMember.id}
            memberName={`${selectedMember.firstName} ${selectedMember.lastName}`}
            onSave={() => {
              // Lógica para guardar membresía
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
          />
        );
    }
  };
  
  return (
    <div className="p-6">
      {/* Cabecera de navegación */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {view === 'list' && 'Socios'}
          {view === 'form' && (isEdit ? 'Editar Socio' : 'Nuevo Socio')}
          {view === 'detail' && 'Detalle de Socio'}
          {view === 'qr' && 'Código QR'}
          {view === 'membership' && 'Asignar Membresía'}
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
      {renderView()}
    </div>
  );
};

export default Members;
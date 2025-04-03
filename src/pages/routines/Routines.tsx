// src/pages/routines/Routines.tsx
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import RoutineList from '../../components/routines/RoutineList';
import { Routine } from '../../types/exercise.types';
import useAuth from '../../hooks/useAuth';

type ViewType = 'list' | 'form' | 'detail' | 'duplicate';

const Routines: React.FC = () => {
  const { gymData } = useAuth();
  
  const [view, setView] = useState<ViewType>('list');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleNewRoutine = () => {
    setSelectedRoutine(null);
    setIsEdit(false);
    setView('form');
  };
  
  const handleEditRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsEdit(true);
    setView('form');
  };
  
  const handleViewRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setView('detail');
  };
  
  const handleDuplicateRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setView('duplicate');
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Rutinas</h1>
      
      {/* Migas de pan (breadcrumbs) */}
      <div className="mb-6 flex items-center text-sm text-gray-600">
        <span 
          className={`${view === 'list' ? 'font-medium text-blue-600' : 'cursor-pointer hover:text-blue-600'}`}
          onClick={() => setView('list')}
        >
          Rutinas
        </span>
        
        {view !== 'list' && (
          <>
            <span className="mx-2">/</span>
            <span 
              className={view === 'detail' ? 'font-medium text-blue-600' : ''}
            >
              {view === 'form' 
                ? (isEdit ? 'Editar Rutina' : 'Nueva Rutina') 
                : view === 'duplicate'
                  ? 'Duplicar Rutina'
                  : selectedRoutine?.name
              }
            </span>
            
            {view === 'form' && isEdit && selectedRoutine && (
              <>
                <span className="mx-2">/</span>
                <span>{selectedRoutine.name}</span>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Mensajes de error y éxito */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Contenido principal */}
      {loading && view !== 'list' ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500">Cargando...</span>
        </div>
      ) : (
        <>
          {view === 'list' && (
            <RoutineList
              onNewRoutine={handleNewRoutine}
              onEditRoutine={handleEditRoutine}
              onViewRoutine={handleViewRoutine}
              onDuplicateRoutine={handleDuplicateRoutine}
            />
          )}
          
          {/* Aquí añadiremos otros componentes como RoutineForm, RoutineDetail, etc. */}
          {/* Estos componentes se implementarán en un paso posterior */}
          {(view === 'form' || view === 'detail' || view === 'duplicate') && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p>Esta funcionalidad está en construcción.</p>
              <p>Pronto podrás {view === 'form' ? (isEdit ? 'editar' : 'crear') : view === 'detail' ? 'ver el detalle de' : 'duplicar'} rutinas.</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setView('list')}
              >
                Volver a la lista
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Routines;
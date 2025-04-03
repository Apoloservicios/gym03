// src/pages/member-routines/MemberRoutines.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const MemberRoutines: React.FC = () => {
  const { gymData } = useAuth();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulamos carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rutinas Asignadas a Socios</h1>
      
      {/* Mensajes de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500">Cargando...</span>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-700 mb-3">Módulo en Desarrollo</h2>
            <p className="text-gray-500 mb-6">
              El módulo de asignación de rutinas a socios está en desarrollo y estará disponible próximamente.
            </p>
            <p className="text-gray-500">
              Este módulo permitirá asignar rutinas personalizadas a cada socio, hacer seguimiento de su progreso y
              recibir retroalimentación sobre su desempeño.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberRoutines;
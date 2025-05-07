// src/pages/SuperAdmin.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import SuperAdminPanel from '../../components/superadmin/SuperAdminPanel';
import GlobalExercisesPanel from '../../components/superadmin/GlobalExercisesPanel';

const SuperAdmin: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const navigate = useNavigate();
  const auth = getAuth();

  // Verificar que el usuario tiene permisos de superadmin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Verificar si el usuario tiene rol de superadmin
        const userRef = doc(db, 'admins', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().rol === 'superadmin') {
          setIsAuthorized(true);
        } else {
          // Redirigir si no es superadmin
          navigate('/login');
        }
      } catch (error) {
        console.error('Error verificando autorización:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Función para cambiar de vista
  const handleChangeView = (view: string) => {
    setCurrentView(view);
  };

  // Renderizar la vista según la selección
  const renderView = () => {
    switch (currentView) {
      case 'exercises':
        return <GlobalExercisesPanel />;
      case 'dashboard':
      default:
        return <SuperAdminPanel />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // El usuario ya fue redirigido
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Sistema de Gestión de Gimnasios</h1>
            <div className="bg-blue-500 px-3 py-1 rounded">SuperAdmin</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex mb-6 space-x-2 overflow-x-auto py-2">
          <button
            onClick={() => handleChangeView('dashboard')}
            className={`px-4 py-2 rounded-md font-medium ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleChangeView('exercises')}
            className={`px-4 py-2 rounded-md font-medium ${
              currentView === 'exercises'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Ejercicios Globales
          </button>
        </div>

        {renderView()}
      </div>
    </div>
  );
};

export default SuperAdmin;
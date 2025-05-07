// src/components/superadmin/SuperAdminHeader.tsx

import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, DollarSign, Settings, 
  LogOut, Menu, X, BarChart2, Package, Dumbbell 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

interface SuperAdminHeaderProps {
  activePage?: string;
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ activePage = 'dashboard' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { id: 'gyms', label: 'Gimnasios', icon: <Users size={20} />, path: '/admin/gyms' },
    { id: 'plans', label: 'Planes', icon: <Package size={20} />, path: '/admin/plans' },
    { id: 'exercises', label: 'Ejercicios', icon: <Dumbbell size={20} />, path: '/admin/exercises' },
    { id: 'metrics', label: 'Métricas', icon: <BarChart2 size={20} />, path: '/admin/metrics' },
    { id: 'settings', label: 'Configuración', icon: <Settings size={20} />, path: '/admin/settings' }
  ];
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm mb-6 -mx-6 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">Panel SuperAdmin</h1>
        </div>
        
        {/* Menú para móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Menú desktop */}
        <nav className="hidden md:flex items-center space-x-4">
          {menuItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activePage === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </span>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <span className="flex items-center">
              <LogOut size={20} />
              <span className="ml-2">Cerrar Sesión</span>
            </span>
          </button>
        </nav>
      </div>
      
      {/* Menú móvil expandido */}
      {menuOpen && (
        <nav className="mt-4 md:hidden">
          <div className="flex flex-col space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activePage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </span>
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 text-left"
            >
              <span className="flex items-center">
                <LogOut size={20} />
                <span className="ml-2">Cerrar Sesión</span>
              </span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default SuperAdminHeader;
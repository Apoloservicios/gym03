// src/App.tsx
import React, { useState } from 'react';

// Nota: importamos desde 'Layout' con L mayúscula para evitar el error de casing
import Sidebar from './components/Layout/Sidebar';
import Members from './pages/members/Members';
import Attendance from './pages/attendance/Attendance';
import Login from './pages/auth/Login';
import BusinessProfile from './pages/settings/BusinessProfile';
import Memberships from './pages/settings/Memberships';
import Dashboard from './pages/dashboard/Dashboard';
import Cashier from './pages/cashier/Cashier';
import Reports from './pages/reports/Reports';
import Activities from './pages/settings/Activities';
import Users from './pages/settings/Users';
import './index.css';


// Definición del componente principal
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Para propósitos de demo
  
  // Renderizar página basado en la selección actual
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Members />;
      case 'attendance':
        return <Attendance />;
      case 'cashier':
        return <Cashier />;
      case 'reports':
        return <Reports />;
      case 'business':
        return <BusinessProfile />;
      case 'memberships':
        return <Memberships />;
      case 'activities':
        return <Activities />;
      case 'users':
        return <Users />;
      default:
        return <Dashboard />;
    }
  };
  
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
      
      <div className="flex-1 md:ml-64 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
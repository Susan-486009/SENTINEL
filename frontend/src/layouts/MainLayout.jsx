import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { logout } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLoginClick={() => window.location.href = '/login'} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

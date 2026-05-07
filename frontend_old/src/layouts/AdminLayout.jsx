import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] selection:bg-primary selection:text-white">
      <Outlet />
    </div>
  );
};

export default AdminLayout;

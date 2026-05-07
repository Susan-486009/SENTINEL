import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ClipboardList, Users, 
  Settings, LogOut, ShieldCheck, BarChart3, 
  Shield, Activity, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Control Center', path: '/admin' },
    { icon: ClipboardList, label: 'Audit Logs', path: '/admin/reports' },
    { icon: Users, label: 'Authority Management', path: '/admin/users' },
    { icon: BarChart3, label: 'Intelligence', path: '/admin/analytics' },
    { icon: Settings, label: 'Core Configuration', path: '/admin/settings' },
  ];

  return (
    <div className="w-64 min-h-screen bg-white flex flex-col border-r border-slate-100 sticky top-0 h-screen z-50">
      
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">Sentinel</h1>
            <p className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1.5">Command Core</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-6">
        <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Operations Terminal</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'text-blue-600 bg-blue-50 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill-admin"
                    className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
                  />
                )}
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status & Profile */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 mb-6 shadow-inner">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-blue-600 text-[11px] shadow-sm">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Clearance: Level 4</p>
                </div>
              </div>
           </div>
           
           <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Protected</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="bg-blue-600 h-full"
                />
              </div>
           </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

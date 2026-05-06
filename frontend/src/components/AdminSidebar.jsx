import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardList, Users, 
  Settings, LogOut, ShieldCheck, BarChart3 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: ClipboardList, label: 'Complaints', path: '/admin/reports' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
  ];

  return (
    <div className="w-72 min-h-screen bg-[#0F172A] flex flex-col border-r border-slate-800">
      {/* Brand */}
      <div className="p-8 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-blue-900/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Sentinel</h1>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">Admin Core</p>
          </div>
        </div>
      </div>

      {/* Profile Small */}
      <div className="p-6">
        <div className="bg-slate-800/30 rounded-2xl p-4 flex items-center gap-3 border border-slate-700/30">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-black text-white text-xs">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white truncate">{user?.name}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-primary text-white shadow-xl shadow-blue-900/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
            `}
          >
            <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800/50">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

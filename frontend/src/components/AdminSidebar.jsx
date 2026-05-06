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
    { icon: LayoutDashboard, label: 'Control Center', path: '/admin' },
    { icon: ClipboardList, label: 'Audit Logs', path: '/admin/reports' },
    { icon: Users, label: 'Authority Management', path: '/admin/users' },
    { icon: BarChart3, label: 'Intelligence', path: '/admin/analytics' },
    { icon: Settings, label: 'Core Configuration', path: '/admin/settings' },
  ];

  return (
    <div className="w-64 min-h-screen bg-[#0B1120] flex flex-col border-r border-slate-800/60 sticky top-0 h-screen">
      {/* Brand */}
      <div className="p-7">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight uppercase italic leading-none">Sentinel</h1>
            <p className="text-[8px] font-black text-blue-500/80 uppercase tracking-[0.3em] mt-1.5">Command Core</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Operations</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
              ${isActive 
                ? 'text-blue-400 bg-blue-500/5' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r-full"
                  />
                )}
                <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status & Profile */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50 mb-4">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-slate-300 text-[10px] border border-slate-700">
                {user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Clearance: Level 4</p>
                </div>
              </div>
           </div>
           
           <div className="pt-3 border-t border-slate-800/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Network Status</span>
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Protected</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
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
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Deactivate Session</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

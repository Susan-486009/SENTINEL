import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-[#111827] rounded-3xl shadow-2xl border border-slate-800/60 p-10 mb-8 overflow-hidden relative group hover:border-blue-500/30 transition-all duration-500">
    <div className="flex items-center gap-4 mb-10">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
        <Icon className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-[11px] font-black text-white tracking-[0.3em] uppercase italic">{title}</h3>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ email: true, push: false, auditing: true });

  const handleSave = () => {
    toast.success('SENTINEL: Preferences Synchronized.');
  };

  const handleLogout = () => {
    logout();
    toast.info('Session Terminated.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Header */}
          <div className="mb-14 text-center">
             <div className="flex items-center justify-center gap-2 mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase italic">System Configuration Terminal</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Control Panel</h1>
            <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest italic opacity-80">Adjust oversight parameters and protocol preferences.</p>
          </div>

          {/* User ID Card */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-blue-600 p-10 rounded-3xl text-white mb-12 shadow-2xl shadow-blue-900/40 flex items-center gap-8 relative overflow-hidden group border border-blue-400/20"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <ShieldCheck className="w-48 h-48 -mr-20 -mt-20" />
             </div>
             
             <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl font-black italic shadow-inner">
               {user?.name?.[0] || 'S'}
             </div>
             
             <div className="relative z-10">
               <h4 className="text-2xl font-black tracking-tighter uppercase italic">{user?.name}</h4>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-2 italic">
                 {user?.role?.toUpperCase()}_CLEARANCE • ID_{user?.id?.toUpperCase()}
               </p>
               <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-1.5 bg-black/20 rounded-lg border border-white/5 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">Active_Oversight_Session</span>
               </div>
             </div>
          </motion.div>

          {/* Profile Section */}
          <Section title="Identity_Profile" icon={User}>
            <div className="space-y-8">
               <div className="space-y-3">
                 <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-1 italic">Legal_Name_Registry</label>
                 <div className="relative">
                   <input 
                    disabled
                    defaultValue={user?.name} 
                    className="w-full px-6 py-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-black text-slate-600 outline-none cursor-not-allowed italic uppercase tracking-widest" 
                   />
                   <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-800" />
                 </div>
                 <p className="text-[8px] font-black text-slate-800 italic uppercase tracking-widest">Modification requires administrative override protocol.</p>
               </div>
               
               <div className="space-y-3">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Verified_Comm_Channel</label>
                 <input 
                  defaultValue={user?.email || 'user@sentinel.edu'} 
                  className="w-full px-6 py-4 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-blue-500/40 focus:bg-slate-900 transition-all outline-none text-xs font-black text-white uppercase tracking-widest italic" 
                 />
               </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Oversight_Alerts" icon={Bell}>
            <div className="space-y-10">
              {Object.entries(notifications).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between group/item">
                  <div className="max-w-[70%]">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest italic group-hover/item:text-blue-500 transition-colors">
                      {key === 'auditing' ? 'Case_Audit_Node' : key === 'email' ? 'Core_Email_Relay' : 'Push_Sync_Network'}
                    </p>
                    <p className="text-[9px] font-bold text-slate-600 mt-1.5 leading-relaxed uppercase tracking-tight italic opacity-80">
                      {key === 'email' ? 'System formal reports transmitted via institutional relay.' : 
                       key === 'push' ? 'Real-time synchronization for dashboard activity nodes.' : 
                       'Emergency alerts for case trajectory changes and peer data packets.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !val })}
                    className={`relative w-12 h-6 rounded-lg transition-all border ${val ? 'bg-blue-600 border-blue-400/20 shadow-lg shadow-blue-900/40' : 'bg-slate-950 border-slate-800'}`}
                  >
                    <motion.span 
                      animate={{ x: val ? 24 : 4 }}
                      className="absolute top-1 w-3 h-3 rounded bg-white shadow-sm" 
                    />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-6 mt-16">
            <button 
              onClick={handleSave} 
              className="flex-1 flex items-center justify-center gap-4 py-5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-blue-900/40 hover:bg-blue-700 hover:-translate-y-1 transition-all border border-blue-400/20"
            >
              <Save className="w-4 h-4" />
              Sync_Parameters
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-4 px-10 py-5 rounded-2xl border border-slate-800 bg-transparent text-red-500 text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-red-500/5 hover:border-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Kill_Session
            </button>
          </div>

          <p className="text-center text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] mt-24 opacity-30 italic">
            SENTINEL_SECURITY_INTERFACE • v2.0.4
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default Settings;

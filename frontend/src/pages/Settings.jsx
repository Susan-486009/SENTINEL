import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-10 mb-8 overflow-hidden relative">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
        <Icon className="w-5 h-5 text-[#1E3A8A]" />
      </div>
      <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase italic">{title}</h3>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ email: true, push: false, auditing: true });

  const handleSave = () => {
    toast.success('SENTINEL: Configuration synchronized locally.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="text-[10px] font-black tracking-[0.4em] text-[#1E3A8A] uppercase italic mb-2 block">System Configuration</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Preferences</h1>
            <p className="text-slate-500 font-medium mt-2">Fine-tune your Sentinel account and oversight settings.</p>
          </div>

          {/* User ID Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#1E3A8A] to-[#172E6D] p-10 rounded-[2.5rem] text-white mb-10 shadow-2xl shadow-blue-900/30 flex items-center gap-8 relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <ShieldCheck className="w-40 h-40 -mr-16 -mt-16" />
             </div>
             
             <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black italic shadow-inner">
               {user?.name?.[0] || 'S'}
             </div>
             
             <div className="relative z-10">
               <h4 className="text-2xl font-black tracking-tighter uppercase italic">{user?.name}</h4>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">
                 {user?.role} • ID {user?.id}
               </p>
               <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Active Core Session</span>
               </div>
             </div>
          </motion.div>

          {/* Profile Section */}
          <Section title="Institutional Profile" icon={User}>
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                 <input 
                  disabled
                  defaultValue={user?.name} 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-400 outline-none cursor-not-allowed italic" 
                 />
                 <p className="text-[10px] font-bold text-slate-300 italic px-1">Name changes must be requested through institutional admin.</p>
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Liaison Email</label>
                 <input 
                  defaultValue={user?.email || 'user@sentinel.edu'} 
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/5 transition-all outline-none text-sm font-bold placeholder:text-slate-200" 
                 />
               </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Communication Auditing" icon={Bell}>
            <div className="space-y-8">
              {Object.entries(notifications).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{key === 'auditing' ? 'Case Audits' : key} Alerts</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">
                      {key === 'email' ? 'Receive formal reports via verified email.' : 
                       key === 'push' ? 'Real-time dashboard activity notifications.' : 
                       'Alerts for case status changes and comments.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !val })}
                    className={`relative w-14 h-7 rounded-full transition-all border-2 ${val ? 'bg-[#1E3A8A] border-[#1E3A8A]' : 'bg-slate-100 border-slate-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all ${val ? 'left-8 shadow-blue-900/40' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-6 mt-12">
            <button 
              onClick={handleSave} 
              className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-[#1E3A8A] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 hover:bg-[#172E6D] hover:-translate-y-1 transition-all"
            >
              <Save className="w-4 h-4" />
              Sync Preferences
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] border-2 border-red-100 bg-white text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:border-red-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Terminate Session
            </button>
          </div>

          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-20 opacity-50">
            SENTINEL AUTH SERVICE v2.0.4 • HIGH SECURITY ENABLED
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default Settings;

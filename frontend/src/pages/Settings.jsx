import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut, Save, ShieldCheck, Lock, ChevronRight, Activity, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Section = ({ title, subtitle, icon: Icon, children }) => (
  <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 p-10 lg:p-12 mb-10 overflow-hidden relative group transition-all duration-500">
    <div className="flex items-start justify-between mb-12">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('System Configuration Updated');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Personal Node Profile</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-3"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 text-center shadow-xl shadow-blue-900/5">
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 rounded-[2.5rem] bg-blue-50 flex items-center justify-center text-blue-600 text-4xl font-black shadow-inner">
                  {user?.name?.[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-blue-600 border-4 border-white flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{user?.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{user?.matric || 'STAFF_REF_ID'}</p>
              
              <div className="pt-8 border-t border-slate-50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Level</span>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Level_4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Age</span>
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">04:12:00</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-4 py-6 rounded-[2rem] border-2 border-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 font-black text-xs uppercase tracking-widest"
            >
              <LogOut className="w-5 h-5" />
              Kill Session
            </button>
          </div>

          {/* Right Column: Settings Sections */}
          <div className="lg:col-span-2">
            <Section title="Account Identity" subtitle="Manage your core profile nodes" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input
                    disabled
                    value={user?.name}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Reference</label>
                  <input
                    disabled
                    value={user?.matric || 'Institutional Staff'}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Communication Node (Email)</label>
                  <input
                    defaultValue={user?.email}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                  />
                </div>
              </div>
            </Section>

            <Section title="Security Protocol" subtitle="Adjust your access ciphers" icon={Shield}>
              <div className="space-y-6">
                 {[
                   { label: 'Current Access Cipher', icon: Lock },
                   { label: 'New Access Cipher', icon: Lock },
                   { label: 'Confirm New Cipher', icon: Lock },
                 ].map((field, i) => (
                   <div key={i} className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                       <field.icon className="w-5 h-5" />
                     </div>
                     <input
                       type="password"
                       placeholder={field.label}
                       className="w-full pl-16 pr-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-xs font-bold text-slate-900 placeholder:text-slate-300"
                     />
                   </div>
                 ))}
              </div>
            </Section>

            <Section title="Transmission Rules" subtitle="Configure notification triggers" icon={Bell}>
               <div className="space-y-4">
                  {[
                    { label: 'Instant Resolution Updates', active: true },
                    { label: 'Protocol Shift Alerts', active: true },
                    { label: 'Weekly Oversight Summary', active: false },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                       <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{rule.label}</span>
                       <button className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${rule.active ? 'bg-blue-600' : 'bg-slate-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${rule.active ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                    </div>
                  ))}
               </div>
            </Section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;

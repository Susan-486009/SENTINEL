import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── strength bar helper ───────────────────────────────── */
const StrengthBar = ({ password }) => {
  const getStrength = (p) => {
    let s = 0;
    if (p.length > 7) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const score = getStrength(password);
  const colors = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-blue-400', 'bg-green-500'];
  const labels = ['Incomplete', 'Weak', 'Fair', 'Strong', 'Secure'];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1 rounded-full flex-1 transition-all duration-500 ${
              score >= n ? colors[score] : 'bg-slate-100'
            }`}
          />
        ))}
      </div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        Cipher_Strength: {labels[score]}
      </p>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fields, setFields] = useState({
    name: '', matric: '', email: '', password: '', confirm: '',
  });

  const set = (key) => (e) => setFields((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(fields);
      setSubmitted(true);
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 max-w-sm w-full text-center border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/10"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100">
            <CheckCircle2 className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter uppercase italic">Registry Updated</h2>
          <p className="text-slate-500 text-xs font-medium mb-10 leading-relaxed">
            Your identity has been established within the LASUSTECH oversight network.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100"
          >
            Access My Terminal
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* Left: Registration Form */}
      <div className="w-full lg:w-[550px] flex flex-col justify-center p-8 md:p-16 relative z-10 bg-white shadow-2xl overflow-y-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-10"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sentinel</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">Create New Account</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Join the Network</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Create your official student or staff profile to participate in institutional accountability.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Legal Identity</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  required
                  value={fields.name}
                  onChange={set('name')}
                  placeholder="FIRSTNAME LASTNAME"
                  className="w-full pl-14 pr-5 py-4.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-[15px] font-medium placeholder:text-slate-300 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Matric Number</label>
                <input
                  required
                  value={fields.matric}
                  onChange={set('matric')}
                  placeholder="2021/400/..."
                  className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-[15px] font-medium placeholder:text-slate-300 uppercase tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Official Email</label>
                <input
                  type="email"
                  value={fields.email}
                  onChange={set('email')}
                  placeholder="EMAIL (OPTIONAL)"
                  className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-[15px] font-medium placeholder:text-slate-300 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Secure Cipher</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  required
                  type={showPass ? 'text' : 'password'}
                  value={fields.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-[15px] font-medium placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors p-2"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <StrengthBar password={fields.password} />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl shadow-blue-100 disabled:opacity-50 mt-8 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Initialize Profile
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-10">
            Already registered?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Access Terminal</Link>
          </p>
        </motion.div>

        <div className="mt-auto pt-8 flex justify-between items-center opacity-40 border-t border-slate-50">
           <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.3em]">Sentinel Systems v2.4</p>
           <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.3em]">LASUSTECH</p>
        </div>
      </div>

      {/* Right: Technical Visuals */}
      <div className="hidden lg:flex flex-1 relative bg-blue-600 overflow-hidden items-center justify-center">
        <img 
          src="/student_registration_background_1778104499891.png" 
          alt="Student Registration" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-600/40" />
        
        <div className="relative z-10 text-white max-w-lg px-12 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-white/20 backdrop-blur-md">
               <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-5xl font-black tracking-tighter uppercase italic leading-tight mb-8">
              Join the<br />Ecosystem.
            </h3>
            <p className="text-blue-50 text-lg font-medium leading-relaxed opacity-90">
              Create your profile and gain access to the most powerful accountability network at LASUSTECH. Your voice matters.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end text-white/40">
           <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white opacity-20" />
              ))}
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em]">Sentinel_Identity_Node</span>
        </div>
      </div>

    </div>
  );
};

export default Register;

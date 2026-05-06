import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

/* ── helpers ──────────────────────────────────────────── */
const validate = ({ identifier, password }) => {
  const errors = {};
  if (!identifier.trim()) {
    errors.identifier = 'Email or Matric Number is required.';
  } else if (
    identifier.includes('@') &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
  ) {
    errors.identifier = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
};

const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  ) : null;

/* ── component ─────────────────────────────────────────── */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [role, setRole]           = useState('student');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [fields, setFields]       = useState({ identifier: '', password: '' });

  const set = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(fields);
      navigate(from, { replace: true });
    } catch {
      // toast.error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B1120] font-sans text-slate-200 overflow-hidden">
      
      {/* Left: Login Form */}
      <div className="w-full lg:w-[450px] flex flex-col justify-center p-8 md:p-16 relative z-10 bg-[#0B1120] border-r border-slate-800/60 shadow-2xl">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Sentinel</h1>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1.5">Security Interface</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Access Protocol</h2>
            <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">
              Authenticate your identity to enter the surveillance network.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-slate-800/50">
            {['student', 'staff'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all duration-300 ${
                  role === r
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2.5 ml-1 italic">
                Identity_Identifier
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={fields.identifier}
                  onChange={set('identifier')}
                  placeholder={role === 'student' ? 'MATRIC NUMBER' : 'STAFF ID'}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all uppercase"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5 ml-1">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Access_Cipher</label>
                <Link to="/forgot-password" size="sm" className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-500 transition-colors">
                  Reset_Key
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={fields.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-blue-500 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-3 overflow-hidden group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="group-hover:translate-x-1 transition-transform">Initialize Access</span>
                  <LogIn className="w-3.5 h-3.5 opacity-50" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-12 italic">
            First time in the field?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Create Authority Profile
            </Link>
          </p>
        </motion.div>

        <div className="mt-auto pt-10 flex justify-between items-center border-t border-slate-800/40">
           <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Sentinel_Core v1.5</p>
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">Secure Link Active</span>
           </div>
        </div>
      </div>

      {/* Right: Technical Visuals */}
      <div className="hidden lg:flex flex-1 relative bg-[#080E1A] overflow-hidden items-center justify-center">
        {/* Abstract Technical Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1E3A8A_0%,transparent_70%)] opacity-30" />
           <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-blue-500/20 flex items-center justify-center relative">
               <div className="absolute inset-4 rounded-full border border-blue-500/10 animate-[spin_10s_linear_infinite]" />
               <div className="absolute inset-8 rounded-full border border-blue-500/5 animate-[spin_15s_linear_infinite_reverse]" />
               <ShieldCheck className="w-24 h-24 text-blue-500/40" />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.5em] italic mb-3">System Integrity Shield</h3>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[280px] leading-relaxed">
              Monitoring LASUSTECH infrastructure with military-grade encryption and real-time accountability protocols.
            </p>
          </div>
        </motion.div>

        {/* Bottom Status Feed */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-between gap-10">
           <div className="flex-1 h-[1px] bg-slate-800 self-center" />
           <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Latency</span>
                <span className="text-[9px] font-black text-blue-500">12ms</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Protocol</span>
                <span className="text-[9px] font-black text-blue-500">AES-256</span>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Login;

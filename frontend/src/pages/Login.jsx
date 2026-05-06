import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen flex bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* Left: Login Form */}
      <div className="w-full lg:w-[500px] flex flex-col justify-center p-8 md:p-20 relative z-10 bg-white shadow-2xl">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sentinel</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">University Support Portal</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Welcome Back</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Log in to your account to report issues, track progress, and access support services.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-10 border border-slate-100">
            {['student', 'staff'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  role === r
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Identity Identifier</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  required
                  type="text"
                  value={fields.identifier}
                  onChange={set('identifier')}
                  placeholder={role === 'student' ? "Email or Matric Number" : "Staff Email"}
                  className="w-full pl-14 pr-5 py-4.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-[15px] font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Access Cipher</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
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
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl shadow-blue-100 disabled:opacity-50 mt-10 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Establish Access
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-12">
            First time here?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">Create Account</Link>
          </p>
        </motion.div>

        <div className="mt-auto pt-10 flex justify-between items-center opacity-40 border-t border-slate-50">
           <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.3em]">Sentinel Systems v2.4</p>
           <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.3em]">LASUSTECH</p>
        </div>
      </div>

      {/* Right: Brand Visual */}
      <div className="hidden lg:flex flex-1 relative bg-blue-600 overflow-hidden items-center justify-center">
        <img 
          src="/university_portal_login_1778104480103.png" 
          alt="LASUSTECH Portal" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-600/40" />
        
        <div className="relative z-10 text-white max-w-lg px-12">
           <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
           >
             <h3 className="text-5xl font-black tracking-tighter uppercase italic leading-tight mb-8">
               Empowering<br />Student Voices.
             </h3>
             <p className="text-blue-50 text-lg font-medium leading-relaxed opacity-90">
               LASUSTECH's primary platform for transparent issue resolution and institutional growth. Join thousands of students making an impact.
             </p>
             
             <div className="mt-12 flex gap-8">
                <div className="flex flex-col">
                   <span className="text-3xl font-black tracking-tighter">98%</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Resolution Rate</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-3xl font-black tracking-tighter">24/7</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">System Uptime</span>
                </div>
             </div>
           </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
           <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white opacity-20" />
              ))}
           </div>
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Sentinel_Secure_Node</span>
        </div>
      </div>

    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

/* ── validation ───────────────────────────────────────── */
const validate = ({ name, matric, email, password, confirm }) => {
  const errors = {};

  if (!name.trim()) {
    errors.name = 'Please enter your full name.';
  } else if (name.trim().split(' ').length < 2) {
    errors.name = 'First and Last name, please.';
  }

  if (!matric.trim()) {
    errors.matric = 'Student ID is required.';
  }

  if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password is too short (min 6).';
  }

  if (!confirm) {
    errors.confirm = 'Confirm your password.';
  } else if (confirm !== password) {
    errors.confirm = 'Passwords do not match.';
  }

  return errors;
};

/* ── strength indicator ──────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabels = ['', 'Too Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

const StrengthBar = ({ password }) => {
  const score = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              score >= n ? strengthColors[score] : 'bg-slate-100'
            }`}
          />
        ))}
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
        {strengthLabels[score]}
      </p>
    </div>
  );
};

/* ── field error ─────────────────────────────────────── */
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
    if (fields.password !== fields.confirm) {
      toast.error('Ciphers do not match.');
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111827] p-12 max-w-sm w-full text-center border border-slate-800 rounded-2xl shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-green-500/20">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter italic">Registration Logged</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10 leading-relaxed italic">
            Identity profile created. You are now authorized to access the Sentinel network.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-primary"
          >
            Access My Terminal
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0B1120] font-sans text-slate-200 overflow-hidden">
      
      {/* Left: Registration Form */}
      <div className="w-full lg:w-[500px] flex flex-col justify-center p-8 md:p-12 relative z-10 bg-[#0B1120] border-r border-slate-800/60 shadow-2xl overflow-y-auto">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="py-12"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Sentinel</h1>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1.5">Authority Registration</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Create Profile</h2>
            <p className="text-slate-500 text-[10px] mt-2 font-black uppercase tracking-[0.2em] leading-relaxed italic">
              Establish your clearance within the LASUSTECH accountability network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2.5 ml-1 italic">Full_Legal_Identity</label>
              <input
                value={fields.name}
                onChange={set('name')}
                placeholder="FIRSTNAME LASTNAME"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2.5 ml-1 italic">Matric_Reference</label>
                <input
                  value={fields.matric}
                  onChange={set('matric')}
                  placeholder="240303010001"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2.5 ml-1 italic">Contact_Node</label>
                <input
                  type="email"
                  value={fields.email}
                  onChange={set('email')}
                  placeholder="EMAIL (OPTIONAL)"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2.5 ml-1 italic">Primary_Access_Cipher</label>
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
              <StrengthBar password={fields.password} />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2.5 ml-1 italic">Repeat_Cipher_Check</label>
              <input
                type="password"
                value={fields.confirm}
                onChange={set('confirm')}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-3 group overflow-hidden"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="group-hover:translate-x-1 transition-transform">Initialize Profile</span>
                  <UserPlus className="w-3.5 h-3.5 opacity-50" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-12 italic">
            Profile already exists?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">Access Terminal</Link>
          </p>
        </motion.div>

        <div className="mt-auto py-8 flex justify-between items-center border-t border-slate-800/40">
           <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Sentinel_Core v1.5</p>
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">Identity Secure</span>
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
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="w-80 h-80 rounded-full border border-blue-500/20 flex items-center justify-center relative">
               <div className="absolute inset-4 rounded-full border border-blue-500/10 animate-[spin_10s_linear_infinite]" />
               <UserPlus className="w-24 h-24 text-blue-500/40" />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.5em] italic mb-3">Community Integrity System</h3>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[280px] leading-relaxed italic">
              Establishing individual accountability nodes to maintain a safe and transparent campus environment.
            </p>
          </div>
        </motion.div>

        <div className="absolute bottom-10 left-10 right-10 flex justify-between gap-10">
           <div className="flex-1 h-[1px] bg-slate-800 self-center" />
           <div className="flex gap-8">
              <div className="flex flex-col text-right">
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Clearance</span>
                <span className="text-[9px] font-black text-blue-500">LEVEL 1</span>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Register;

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
const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 mt-1.5 uppercase tracking-wider">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  ) : null;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fields, setFields] = useState({
    name: '', matric: '', email: '', password: '', confirm: '',
  });
  const [touched, setTouched] = useState({});

  const errors = validate(fields);
  const hasErrors = Object.keys(errors).length > 0;

  const set = (key) => (e) => setFields((p) => ({ ...p, [key]: e.target.value }));
  const blur = (key) => () => setTouched((p) => ({ ...p, [key]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, matric: true, email: true, password: true, confirm: true });
    if (hasErrors) {
      toast.error('Please fix the errors.');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-premium p-12 max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-green-900/10">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight italic">Welcome Aboard!</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
            Great to have you here, <strong>{fields.name.split(' ')[0]}</strong>. Your account is ready!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-primary"
          >
            Go to My Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 pt-20 pb-32 md:pb-20 px-4 font-sans overflow-x-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-300/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-md"
      >
        <div className="card-premium overflow-hidden">
          <div className="bg-primary px-10 py-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <UserPlus className="w-32 h-32 -mr-10 -mt-10 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Sentinel Care</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Create Account</h1>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-2">Join our student care community.</p>
              <div className="mt-4 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-100/70">Anonymity focused reporting platform</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-10 space-y-7">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Full Name</label>
              <input
                id="reg-name"
                value={fields.name}
                onChange={set('name')}
                onBlur={blur('name')}
                placeholder="e.g. David Oluwaseun"
                className="input-premium"
              />
              <FieldError msg={touched.name && errors.name} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Student ID #</label>
                <input
                  id="reg-matric"
                  value={fields.matric}
                  onChange={set('matric')}
                  onBlur={blur('matric')}
                  placeholder="e.g. 240303010001"
                  className="input-premium pr-14"
                />
                <FieldError msg={touched.matric && errors.matric} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email (Optional)</label>
                <input
                  id="reg-email"
                  type="email"
                  value={fields.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  placeholder="e.g. student@edu.ng"
                  className="input-premium pr-14"
                />
                <FieldError msg={touched.email && errors.email} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Set Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={fields.password}
                  onChange={set('password')}
                  onBlur={blur('password')}
                  placeholder="••••••••"
                  className="input-premium pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <StrengthBar password={fields.password} />
              <FieldError msg={touched.password && errors.password} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={fields.confirm}
                  onChange={set('confirm')}
                  onBlur={blur('confirm')}
                  placeholder="••••••••"
                  className="input-premium pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError msg={touched.confirm && errors.confirm} />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Join Sentinel</>
              )}
            </motion.button>
          </form>

          <div className="px-10 pb-12 text-center -mt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-black">Sign In</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-10 opacity-50">
          SENTINEL v1.5 • LASUSTECH
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
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
  const [touched, setTouched]     = useState({});
  const [fields, setFields]       = useState({ identifier: '', password: '' });

  const errors = validate(fields);
  const hasErrors = Object.keys(errors).length > 0;

  const set = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  };
  const blur = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all touched so errors show
    setTouched({ identifier: true, password: true });
    if (hasErrors) return;

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 pt-12 pb-32 md:pb-12 px-4 font-sans">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-0 left-0 w-[600px] h-[600px] bg-[#1E3A8A]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100/50 overflow-hidden backdrop-blur-sm">

          <div className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/20 rotate-3">
                <LogIn className="w-8 h-8 text-white -mr-1" />
              </div>
              <h1 className="text-[2rem] font-black text-slate-900 tracking-tighter uppercase italic">SENTINEL</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 px-4 leading-relaxed">
                {role === 'student'
                  ? 'Student Care Portal'
                  : 'Staff Management Portal'}
              </p>
            </div>

            {/* Role Switcher Pills */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100 shadow-inner">
              {['student', 'staff'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                    role === r
                      ? 'bg-white text-primary shadow-premium'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Email / Matric */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  {role === 'student' ? 'Student ID or Email' : 'Staff ID or Email'}
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  value={fields.identifier}
                  onChange={set('identifier')}
                  onBlur={blur('identifier')}
                  placeholder={role === 'student' ? 'e.g. 240303010001' : 'e.g. STF-0042'}
                  className={`input-premium
                    ${touched.identifier && errors.identifier
                      ? 'border-red-200 bg-red-50 focus:ring-red-100'
                      : ''
                    }`}
                />
                <FieldError msg={touched.identifier && errors.identifier} />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={fields.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
                    placeholder="••••••••"
                    className={`input-premium pr-14
                      ${touched.password && errors.password
                        ? 'border-red-200 bg-red-50 focus:ring-red-100'
                        : ''
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <FieldError msg={touched.password && errors.password} />
              </div>

              {/* Submit */}
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
                  <>
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-10">
              New to Sentinel?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-8 opacity-50">
          SENTINEL PLATFORM v1.0.0
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

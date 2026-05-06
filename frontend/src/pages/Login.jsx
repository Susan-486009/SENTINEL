import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Mail, Lock, ArrowRight, 
  ChevronRight, AlertCircle, Eye, EyeOff, 
  GraduationCap, Building2, UserCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${result.user.name}!`);
      const from = location.state?.from?.pathname || (result.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl w-full mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
        
        {/* Left Side: Educational Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left hidden lg:block"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-100/50 border border-blue-200 mb-10 shadow-sm">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">LASUSTECH Official Portal</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-10">
            Welcome <br />
            <span className="text-blue-600">Back.</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
            Access your student or staff account to manage reports and track resolutions at Lagos State University of Science and Technology.
          </p>

          <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Secure Institutional Access
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl shadow-blue-900/5 border border-slate-100">
            
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <UserCircle className="w-7 h-7" />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Login</h2>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enter your details below to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Email or Matric Number</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-premium pl-16"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-premium pl-16 pr-16"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-4"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-blue-600 font-black hover:text-blue-700 ml-2">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

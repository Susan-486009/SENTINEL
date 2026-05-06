import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Smart Input Handling: Auto-trim whitespace for email
    const processedValue = name === 'email' ? value.trim() : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      toast.success('Authentication successful');
      const from = location.state?.from?.pathname || (result.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      
      {/* Refined Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      <div className="max-w-4xl w-full flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-10">
        
        {/* Left Side: Branding (Visible on Desktop) */}
        <div className="hidden lg:flex flex-1 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-blue-600/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
               <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
               </div>
               <span className="text-white font-bold tracking-tight">LASUSTECH</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-6">
              Official <br />Support Portal
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              Access the official management system for student support and institutional reporting.
            </p>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Institutional Verification Required
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-sm mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                 <UserCircle className="w-5 h-5 text-blue-600" />
                 <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In</h2>
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Lagos State University of Science and Technology</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email or ID</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-professional pl-11"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-700">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-professional pl-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs font-medium text-slate-500">
                New to the portal?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 ml-1">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

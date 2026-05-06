import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Mail, Lock, User, 
  ArrowRight, CheckCircle2, UserCircle,
  GraduationCap, Building2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // default
    matricNumber: '',
    staffId: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans py-20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl w-full mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
        
        {/* Left Side: Educational Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left hidden lg:block"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-100/50 border border-blue-200 mb-10 shadow-sm">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Join the LASUSTECH Community</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-10">
            Create <br />
            <span className="text-blue-600">Account.</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
            Register your official LASUSTECH profile to access the support portal and report issues directly to the university administration.
          </p>

          <div className="space-y-6">
             {[
               "Official University Verification",
               "Real-time Tracking of Reports",
               "Direct Access to Support Teams"
             ].map((text, i) => (
               <div key={i} className="flex items-center gap-4 text-slate-600 font-bold text-xs uppercase tracking-widest">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  {text}
               </div>
             ))}
          </div>
        </motion.div>

        {/* Right Side: Register Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl shadow-blue-900/5 border border-slate-100">
            
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <UserCircle className="w-7 h-7" />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Sign Up</h2>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Fill out the form below to register.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Role Switcher */}
              <div className="flex p-1.5 bg-slate-100 rounded-full mb-10">
                {['student', 'staff'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                      formData.role === r 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {r === 'student' ? <GraduationCap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    {r} account
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-premium pl-16"
                      placeholder="JOHN DOE"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-premium pl-16"
                      placeholder="NAME@EXAMPLE.COM"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">
                    {formData.role === 'student' ? 'Matric Number' : 'Staff ID'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.role === 'student' ? formData.matricNumber : formData.staffId}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [formData.role === 'student' ? 'matricNumber' : 'staffId']: e.target.value 
                      })}
                      className="input-premium pl-16"
                      placeholder={formData.role === 'student' ? '2021/XXX/XXXX' : 'LAS/ST/XXXX'}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Password</label>
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
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-premium pl-16"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-4"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                  <>
                    Create My Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Already have an official account?{' '}
                <Link to="/login" className="text-blue-600 font-black hover:text-blue-700 ml-2">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

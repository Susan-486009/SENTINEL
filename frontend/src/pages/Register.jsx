import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, UserCircle, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    matricNumber: '',
    staffId: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Smart Input Handling
    if (name === 'email') processedValue = value.trim();
    if (name === 'matricNumber' || name === 'staffId') processedValue = value.toUpperCase(); // Auto-format ID

    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Registration successful. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 py-20">
      
      {/* Refined Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      <div className="max-w-4xl w-full flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-10">
        
        {/* Left Side: Branding */}
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
              Create Your <br />Profile
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              Register with your official institutional identity to access support services.
            </p>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Identity Verification Required
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                 <UserCircle className="w-5 h-5 text-blue-600" />
                 <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Registration</h2>
              </div>
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Lagos State University of Science and Technology</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Role Toggle - Professional Style */}
              <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
                {['student', 'staff'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      formData.role === r 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {r === 'student' ? <GraduationCap className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                    {r}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-professional pl-11"
                      placeholder="JOHN DOE"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Official Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-professional pl-11"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    {formData.role === 'student' ? 'Matric Number' : 'Staff ID'}
                  </label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      name={formData.role === 'student' ? 'matricNumber' : 'staffId'}
                      required
                      value={formData.role === 'student' ? formData.matricNumber : formData.staffId}
                      onChange={handleInputChange}
                      className="input-professional pl-11"
                      placeholder={formData.role === 'student' ? '2021/XXX/XXXX' : 'LAS/ST/XXXX'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
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
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-professional pl-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                  <>
                    Create My Profile
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs font-medium text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

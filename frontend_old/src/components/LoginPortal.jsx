import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogIn, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const LoginPortal = ({ isOpen, onClose }) => {
  const [role, setRole] = useState('student');

  const handleLogin = (e) => {
    e.preventDefault();
    toast.info(`Future Integration: ${role} authentication logic will be implemented here.`);
  };

  if (!isOpen) return null;

  return (
    <div className="py-24 bg-slate-50" id="login">
      <div className="max-w-xl mx-auto px-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden"
        >
          <div className="flex">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${role === 'student' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Student Portal
            </button>
            <button 
              onClick={() => setRole('staff')}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${role === 'staff' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Staff Portal
            </button>
          </div>

          <div className="p-10">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                {role === 'student' ? <User className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 capitalize">{role} Login</h2>
              <p className="text-slate-500 text-sm mt-2">Enter your credentials to access your dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">ID Number</label>
                <input 
                  type="text" 
                  placeholder={role === 'student' ? "Matric Number" : "Staff Number"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 mt-6"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            </form>

            <div className="mt-8 text-center">
              <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-8">
            <button onClick={onClose} className="text-slate-500 text-sm hover:text-primary transition-colors">
                ← Back to Homepage
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;

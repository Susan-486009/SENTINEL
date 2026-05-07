import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 py-12 px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-white/50 overflow-hidden">
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/20 rotate-3">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Reset Password</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
              We'll help you get back in.
            </p>

            <div className="mt-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-left">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Email or ID Number
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. 240303010001"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-bold"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reset Link
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="py-8 px-4 bg-green-50 rounded-3xl border border-green-100 flex flex-col items-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                    <p className="text-sm font-bold text-green-800">Check your inbox!</p>
                    <p className="text-xs text-green-600/80 mt-1">If an account exists for {email}, you will receive reset instructions shortly.</p>
                  </div>
                  
                  <Link to="/login" className="w-full btn-outline flex items-center justify-center gap-3">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </motion.div>
              )}
            </div>

            {!submitted && (
              <div className="mt-8">
                <Link to="/login" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Actually, I remember!
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

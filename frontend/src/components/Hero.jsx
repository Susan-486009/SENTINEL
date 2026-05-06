import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Zap, Users } from 'lucide-react';
import heroImg from '../assets/nigerian_students_hero.png';

const Hero = ({ onReportClick }) => {
  return (
    <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[700px] h-[700px] bg-blue-50/50 rounded-full blur-[120px] opacity-40 select-none pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-30 select-none pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* ── Left Content: The Message ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-10 text-[10px] font-black tracking-[0.2em] text-primary uppercase bg-primary/5 rounded-full border border-primary/10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Empowering Students
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-8 tracking-[-0.04em] leading-[0.95]">
              Justice and <br />
              <span className="text-primary italic font-black relative">
                Fairness
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
                </svg>
              </span> for All.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-xl leading-relaxed font-medium">
              Sentinel provides a secure, transparent bridge between students and administration. 
              Report issues privately and watch resolution happen in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReportClick}
                className="px-10 py-5 rounded-2xl bg-primary text-white text-[13px] font-bold uppercase tracking-wider shadow-[0_20px_40px_-10px_rgba(30,58,138,0.3)] hover:bg-blue-800 transition-all flex items-center justify-center gap-3 group"
              >
                <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Launch Report
              </motion.button>
              
              <Link 
                to="/track"
                className="px-10 py-5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[13px] font-bold uppercase tracking-wider hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
              >
                Track Progress
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="mt-16 pt-10 border-t border-slate-100 flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-slate-900 tracking-tight">99.8%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resolution Rate</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary tracking-tight italic">{"< 24h"}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Response</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right Content: Visual Trust ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-[8px] border-white group">
               <img 
                src={heroImg} 
                alt="Students on Campus" 
                className="w-full h-[650px] object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
               
               {/* Context Card */}
               <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/50"
               >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-blue-900/20">
                      <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Secure & Encrypted</p>
                      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Your identity is protected by industry-grade encryption and strict privacy protocols.</p>
                    </div>
                  </div>
               </motion.div>
            </div>

            {/* Floating Accents */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 z-10"
            >
               <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                 <Users className="w-5 h-5 text-green-600" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xs font-black text-slate-900 tracking-tight">5,000+ Students</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Community</span>
               </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Zap, Users, Shield } from 'lucide-react';

const Hero = ({ onReportClick }) => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden bg-white">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Institution Oversight</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8">
              Your Voice,<br />
              <span className="text-blue-600">Our Accountability.</span>
            </h1>

            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-12 max-w-lg">
              Sentinel is LASUSTECH's official platform for transparent issue reporting and institutional resolution. We bridge the gap between reports and results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <button
                onClick={onReportClick}
                className="group flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
              >
                Send Official Report
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/track"
                className="flex items-center justify-center gap-3 bg-white border border-slate-100 hover:border-blue-200 text-slate-600 px-8 py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-blue-50/30"
              >
                Track Case Status
                <Shield className="w-4 h-4 text-blue-600 opacity-50" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100">
               <div>
                  <p className="text-2xl font-black text-slate-900 leading-none mb-1">10k+</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reports Logged</p>
               </div>
               <div>
                  <p className="text-2xl font-black text-slate-900 leading-none mb-1">24h</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Avg Response</p>
               </div>
               <div>
                  <p className="text-2xl font-black text-slate-900 leading-none mb-1">94%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Satisfaction</p>
               </div>
            </div>
          </motion.div>

          {/* Visual Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
               <img 
                 src="/university_portal_login_1778104480103.png" 
                 alt="Sentinel Portal Interface" 
                 className="rounded-[2rem] w-full h-[500px] object-cover"
               />
               
               {/* Floating Data Card */}
               <div className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-xl border border-white p-6 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                        <ShieldCheck className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case_Oversight</p>
                        <p className="text-sm font-black text-slate-900 uppercase">Protocol: Active</p>
                     </div>
                  </div>
                  <div className="flex gap-1.5">
                     {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="h-1 flex-1 bg-blue-600 rounded-full" />
                     ))}
                  </div>
               </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute -z-10 top-1/2 -left-12 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-0 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

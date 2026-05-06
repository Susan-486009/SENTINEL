import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Shield, GraduationCap, Building2, Users } from 'lucide-react';

const Hero = ({ onReportClick }) => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden bg-white">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 mb-10 shadow-sm">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Official LASUSTECH Support Portal</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-8">
              Supporting Every <br />
              <span className="text-blue-600">Student's Success.</span>
            </h1>

            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12 max-w-lg">
              Lagos State University of Science and Technology's official platform for reporting concerns and getting help. We are here to listen and help you resolve campus issues.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-16">
              <button
                onClick={onReportClick}
                className="group flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-blue-100 hover:-translate-y-1 active:scale-95"
              >
                Submit a Report
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/track"
                className="flex items-center justify-center gap-4 bg-white border-2 border-slate-100 hover:border-blue-600 text-slate-600 hover:text-blue-600 px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:bg-blue-50/20"
              >
                Track My Case
                <Shield className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-10 pt-10 border-t border-slate-100">
               <div>
                  <p className="text-3xl font-black text-slate-900 mb-1">100%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidential</p>
               </div>
               <div>
                  <p className="text-3xl font-black text-slate-900 mb-1">24h</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Response Time</p>
               </div>
               <div>
                  <p className="text-3xl font-black text-slate-900 mb-1">98%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Rate</p>
               </div>
            </div>
          </motion.div>

          {/* Visual Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white p-6 rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
               <img 
                 src="/university_portal_login_1778104480103.png" 
                 alt="LASUSTECH Campus" 
                 className="rounded-[2.5rem] w-full h-[540px] object-cover"
               />
               
               {/* Label Overlay */}
               <div className="absolute top-10 left-10 right-10 bg-white/90 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                        <Building2 className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">LASUSTECH Main Campus</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Lagos State University of Science and Technology</p>
                     </div>
                  </div>
               </div>

               {/* Stats Overlay */}
               <div className="absolute bottom-10 left-10 right-10 flex gap-4">
                  <div className="flex-1 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-lg">
                     <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community</span>
                     </div>
                     <p className="text-xl font-black text-slate-900">Supportive Network</p>
                  </div>
               </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute -z-10 top-1/2 -left-16 -translate-y-1/2 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-0 -right-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

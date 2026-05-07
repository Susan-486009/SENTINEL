import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Shield, GraduationCap, Building2 } from 'lucide-react';

const Hero = ({ onReportClick }) => {
  return (
    <section className="relative pt-24 pb-16 lg:pt-40 lg:pb-32 overflow-hidden bg-white border-b border-slate-100">
      
      {/* Refined Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-100 mb-8">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">LASUSTECH Support Portal</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Supporting Every <br />
              <span className="text-blue-600">Student's Success.</span>
            </h1>

            <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
              Official platform for Lagos State University of Science and Technology. Report concerns, track progress, and access institutional support in a secure, professional environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <button
                onClick={onReportClick}
                className="btn-primary flex items-center justify-center gap-2 group px-8 py-3"
              >
                Submit a Report
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <Link
                to="/track"
                className="btn-outline flex items-center justify-center gap-2 px-8 py-3"
              >
                Track Status
                <Shield className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-8 py-6 border-t border-slate-100">
               <div>
                  <p className="text-xl font-bold text-slate-900">100%</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Confidential</p>
               </div>
               <div className="w-px h-8 bg-slate-100" />
               <div>
                  <p className="text-xl font-bold text-slate-900">24h</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Response</p>
               </div>
               <div className="w-px h-8 bg-slate-100" />
               <div>
                  <p className="text-xl font-bold text-slate-900">98%</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Resolved</p>
               </div>
            </div>
          </motion.div>

          {/* Visual Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 bg-white p-3 rounded-2xl shadow-premium border border-slate-200">
               <img 
                 src="/university_portal_login_1778104480103.png" 
                 alt="LASUSTECH Campus" 
                 className="rounded-xl w-full h-[480px] object-cover"
               />
               
               {/* Refined Info Card */}
               <div className="absolute top-8 left-8 right-8 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <Building2 className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-900">Main Campus Gateway</p>
                        <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider mt-0.5">Ikorodu, Lagos State</p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

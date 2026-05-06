import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Zap, Users } from 'lucide-react';
import heroImg from '../assets/nigerian_students_hero.png';

const Hero = ({ onReportClick }) => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden bg-[#0B1120]">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full opacity-50 select-none pointer-events-none" />
      
      {/* Scanning Line Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-10 text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase bg-blue-600/5 rounded-lg border border-blue-500/20 shadow-lg shadow-blue-900/10 italic">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              System_Operational // Sentinel_v2.5
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-8 tracking-[-0.05em] leading-[0.85] uppercase italic">
              Justice. <br />
              <span className="text-blue-600">Encoded.</span>
            </h1>
            
            <p className="text-sm md:text-base text-slate-500 mb-14 max-w-xl leading-relaxed font-bold uppercase tracking-widest italic opacity-80">
              The institutional monitoring network for LASUSTECH. Secure, high-precision reporting protocols for a transparent campus ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReportClick}
                className="px-10 py-5 rounded-xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-blue-900/40 hover:bg-blue-700 transition-all flex items-center justify-center gap-4 group border border-blue-400/20"
              >
                <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                INIT_REPORT_PROTOCOL
              </motion.button>
              
              <Link 
                to="/track"
                className="px-10 py-5 rounded-xl bg-transparent border border-slate-800 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] italic hover:text-white hover:border-slate-600 hover:bg-slate-900/50 transition-all flex items-center justify-center gap-4 group"
              >
                MONITOR_PROGRESS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="mt-20 pt-12 border-t border-slate-900/60 grid grid-cols-2 gap-12 max-w-sm">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tighter italic">99.8%</span>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mt-2">Resolution_Index</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-blue-600 tracking-tighter italic">{"< 24H"}</span>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mt-2">Sync_Latency</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group aspect-[4/5]">
               <img 
                src={heroImg} 
                alt="Infrastructure" 
                className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 scale-105 group-hover:scale-100"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
               
               {/* Context Overlay */}
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-8 left-8 right-8 bg-[#111827]/90 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-2xl"
               >
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase italic tracking-widest">Active_Encryption_Active</p>
                      <p className="text-[9px] font-bold text-slate-600 mt-2 leading-relaxed uppercase tracking-tight italic">
                        IDENTITY METADATA IS AUTOMATICALLY STRIPPED FROM ALL OUTGOING DATA PACKETS UNLESS VERIFICATION IS EXPLICITLY REQUESTED.
                      </p>
                    </div>
                  </div>
               </motion.div>

               {/* Data Points */}
               <div className="absolute top-10 left-10 space-y-4">
                  {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (i * 0.2) }}
                      className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-white/5 px-3 py-1.5 rounded-lg"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Node_0{i}_Sync</span>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 bg-[#111827] p-6 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-5 z-10"
            >
               <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                 <Users className="w-6 h-6 text-white" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xl font-black text-white tracking-tighter italic">5,000+</span>
                 <span className="text-[7px] font-black text-slate-700 uppercase tracking-[0.4em] italic mt-1">Authorized_Nodes</span>
               </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;

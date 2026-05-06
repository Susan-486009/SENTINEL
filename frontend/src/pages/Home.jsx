import React, { useState } from 'react';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import ReportModal from '../components/ReportModal';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, TrendingUp, Users } from 'lucide-react';
import campusImg from '../assets/lasustech_campus_scene.png';

const Home = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="bg-[#0B1120] overflow-hidden">
      <Hero onReportClick={() => setIsReportModalOpen(true)} />
      <FeatureCards />
      
      {/* Institutional Impact Section */}
      <section className="py-32 bg-[#0B1120] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group"
            >
               <img 
                src={campusImg} 
                alt="LASUSTECH Infrastructure" 
                className="w-full h-[600px] object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
               />
               <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1120] to-transparent opacity-80" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                <span className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase italic">Directive_Mission_401</span>
              </div>
              <h2 className="text-5xl sm:text-6xl font-black text-white mb-10 tracking-tighter leading-none uppercase italic">
                Architecting <br />
                <span className="text-blue-600">Integrity.</span>
              </h2>
              <p className="text-base text-slate-500 mb-14 font-bold leading-relaxed uppercase tracking-widest italic opacity-80">
                Sentinel acts as the primary institutional watchdog, ensuring every data point contributes to a more transparent ecosystem. 
                Absolute accountability through immutable audit logs.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-12">
                <div className="group">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                    <Target className="w-6 h-6 text-blue-500 group-hover:text-white" />
                  </div>
                  <h4 className="text-[10px] font-black text-white mb-3 uppercase tracking-widest italic">Node_Transparency</h4>
                  <p className="text-[9px] font-bold text-slate-600 leading-relaxed uppercase italic">Track every lifecycle phase with real-time encrypted status updates.</p>
                </div>
                <div className="group">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                    <TrendingUp className="w-6 h-6 text-blue-500 group-hover:text-white" />
                  </div>
                  <h4 className="text-[10px] font-black text-white mb-3 uppercase tracking-widest italic">Systemic_Optimization</h4>
                  <p className="text-[9px] font-bold text-slate-600 leading-relaxed uppercase italic">Data-driven resolution cycles focused on long-term institutional stability.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 bg-[#111827]/30 border-y border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            <span className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase italic">Execution_Protocol</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-24 tracking-tighter uppercase italic">Resolution Path</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                title: 'Data_Ingress', 
                desc: 'Secure documentation of institutional anomalies via encrypted submission nodes.',
                icon: ShieldCheck
              },
              { 
                step: '02', 
                title: 'Packet_Tracking', 
                desc: 'Generation of unique Protocol IDs for real-time monitoring of the investigation trajectory.',
                icon: Target
              },
              { 
                step: '03', 
                title: 'Final_Resolution', 
                desc: 'Verified administrative resolution cycles with full audit log finalization.',
                icon: TrendingUp
              }
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-[#111827] p-12 rounded-3xl border border-slate-800 group hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-black italic shadow-2xl shadow-blue-900/40 border border-blue-400/20">
                  {s.step}
                </div>
                <div className="mt-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex items-center justify-center mb-10 group-hover:bg-blue-600 transition-colors duration-500">
                    <s.icon className="w-8 h-8 text-blue-500 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest italic">{s.title}</h3>
                  <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase tracking-widest italic opacity-80">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section id="about" className="py-40 bg-[#0B1120] relative">
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
             <div className="flex items-center justify-center gap-2 mb-8">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black tracking-[0.5em] text-blue-500 uppercase italic">Institutional_Mandate</span>
            </div>
            <h2 className="text-5xl font-black text-white mb-10 tracking-tighter uppercase italic">System Commitment</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-bold uppercase tracking-widest italic opacity-80">
              Fairness is the fundamental core of the LASUSTECH ecosystem. 
              Sentinel was architected to ensure every voice is synchronized 
              with a professional, low-latency administrative response.
            </p>
          </div>
      </section>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
};

export default Home;

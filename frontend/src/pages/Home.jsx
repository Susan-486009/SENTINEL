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
    <>
      <Hero onReportClick={() => setIsReportModalOpen(true)} />
      <FeatureCards />
      
      {/* ── Institutional Impact Section ────────────────────── */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100"
            >
               <img 
                src={campusImg} 
                alt="LASUSTECH Campus" 
                className="w-full h-[550px] object-cover"
               />
               <div className="absolute inset-0 bg-[#1E3A8A]/10 mix-blend-multiply" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#1E3A8A]/20 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[11px] font-black tracking-[0.2em] text-primary uppercase mb-6 block">Our Mission</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-10 tracking-tight leading-tight">
                Building a Better <br />
                <span className="text-primary italic">Campus Experience.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-12 font-medium leading-relaxed">
                Sentinel acts as a vital bridge, ensuring every student voice contributes to a fairer, 
                more transparent institution. We're committed to rapid resolution and absolute accountability.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-10">
                <div className="group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-2">Total Transparency</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Track every stage of your report's lifecycle with real-time updates.</p>
                </div>
                <div className="group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-2">Systemic Growth</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Your data helps us identify patterns and implement long-term solutions.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How it Works Section ────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] font-black tracking-[0.3em] text-primary uppercase mb-6 block">Step-by-Step</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-20 tracking-tight">The Path to Resolution</h2>
          
          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
            {[
              { 
                step: '01', 
                title: 'Secure Submission', 
                desc: 'Easily document your concerns. Choose to stay 100% anonymous or provide details.',
                icon: ShieldCheck
              },
              { 
                step: '02', 
                title: 'Instant Tracking', 
                desc: 'Receive a unique Reference ID. Monitor progress without ever needing to log in.',
                icon: Target
              },
              { 
                step: '03', 
                title: 'Verified Results', 
                desc: 'Our administrative team reviews and resolves. Receive official findings promptly.',
                icon: TrendingUp
              }
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-lg font-black italic shadow-xl shadow-blue-900/30">
                  {s.step}
                </div>
                <div className="mt-8 flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <s.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">{s.title}</h3>
                  <p className="text-[15px] text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <h2 className="text-4xl font-extrabold mb-8 tracking-tight italic">Our Commitment</h2>
            <p className="text-blue-100 text-xl leading-relaxed font-medium">
              We believe fairness is the foundation of a great university. 
              Sentinel was built to ensure that every LASUSTECH student has a voice 
              and every concern is met with a professional, timely response.
            </p>
          </div>
      </section>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </>
  );
};

export default Home;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import ReportModal from '../components/ReportModal';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, TrendingUp, Users, ArrowRight, Shield } from 'lucide-react';
import campusImg from '../assets/lasustech_campus_scene.png';

const Home = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <Hero onReportClick={() => setIsReportModalOpen(true)} />

      {/* Feature Section */}
      <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-20">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Core Framework</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Designed for <span className="text-blue-600">Total Transparency.</span>
            </h3>
          </div>
          
          <FeatureCards />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: "Cases Solved", val: "1,240+", icon: ShieldCheck },
              { label: "Success Rate", val: "98.5%", icon: TrendingUp },
              { label: "Avg Resolution", val: "48h", icon: Target },
              { label: "Users Active", val: "15.2k", icon: Users },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-4xl font-black text-slate-900 mb-2">{stat.val}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden shadow-2xl shadow-blue-200">
             {/* Decorative Background */}
             <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                <img src="/university_portal_login_1778104480103.png" alt="Overlay" className="w-full h-full object-cover" />
             </div>
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/50 to-transparent" />

             <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight mb-8">
                   Ready to Make <br />a Difference?
                </h2>
                <p className="text-blue-50 text-lg font-medium leading-relaxed mb-12 opacity-90">
                   Your reports help us identify institutional gaps and improve the campus experience for everyone. Join the Sentinel network today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                     onClick={() => setIsReportModalOpen(true)}
                     className="bg-white text-blue-600 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 hover:-translate-y-1 transition-all shadow-xl active:scale-95"
                   >
                     Submit My First Report
                   </button>
                   <Link 
                     to="/register" 
                     className="flex items-center justify-center gap-3 bg-blue-700 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 hover:-translate-y-1 transition-all"
                   >
                     Create Account
                     <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>

             <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Campus Context Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Institutional Presence</h2>
                 <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                    Bridging the gap between <br /><span className="text-blue-600">Campus & Authority.</span>
                 </h3>
                 <p className="text-slate-500 font-medium leading-relaxed mb-10">
                    Sentinel operates as a neutral, encrypted layer between the student body and university administration. We ensure that every valid concern is documented, analyzed, and addressed through official channels.
                 </p>
                 <div className="space-y-4">
                    {[
                      "End-to-End Encryption for Anonymous Reporting",
                      "Automated Evidence Collection & Validation",
                      "Real-time Dashboard for Transparency",
                      "Institutional Accountability Feedback Loops"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                         <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                         </div>
                         <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">{item}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="relative group">
                 <div className="absolute inset-0 bg-blue-600/10 rounded-[3rem] blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />
                 <img 
                   src={campusImg} 
                   alt="LASUSTECH Campus" 
                   className="relative z-10 w-full h-[400px] object-cover rounded-[3.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 border-8 border-white" 
                 />
              </div>
           </div>
        </div>
      </section>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </main>
  );
};

export default Home;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ReportModal from '../components/ReportModal';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, BookOpen, HelpCircle, UserPlus,
  ArrowRight, Flag, Heart
} from 'lucide-react';
import campusImg from '../assets/lasustech_campus_scene.png';

const Home = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <Hero onReportClick={() => setIsReportModalOpen(true)} />

      {/* About Us & Mission - High Density Layout */}
      <section id="about" className="py-16 lg:py-24 bg-white border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src={campusImg} 
                alt="Campus life" 
                className="relative z-10 w-full h-[440px] object-cover rounded-2xl border border-slate-100 shadow-sm"
              />
              <div className="absolute -bottom-6 -right-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-md hidden md:block max-w-[200px]">
                 <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                   <Heart className="w-5 h-5 text-blue-600" />
                 </div>
                 <p className="text-sm font-bold text-slate-900 leading-tight">Student-First Approach to Support.</p>
              </div>
            </motion.div>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 mb-6">
                <Flag className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Institutional Mission</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-6">
                A Secure Voice for Every <span className="text-blue-600">Student.</span>
              </h2>
              <p className="text-base text-slate-500 font-medium leading-relaxed mb-8">
                Lagos State University of Science and Technology is committed to transparency and student welfare. This portal provides an official, secure channel for you to report concerns directly to administration.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: "Transparency", desc: "Open communication between campus and authority." },
                  { title: "Accountability", desc: "Every valid report is officially reviewed." },
                  { title: "Privacy", desc: "Secure encryption for all student interactions." },
                  { title: "Efficiency", desc: "Rapid response times for critical campus issues." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Breakdown - Professional Compact Grid */}
      <section className="py-16 lg:py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Official Workflow</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Professional Resolution Process.
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, step: "01", title: "Documentation", desc: "Provide details of your concern via our secure form. Evidence uploads are supported." },
              { icon: HelpCircle, step: "02", title: "Review Cycle", desc: "Authorized teams evaluate the report and coordinate with relevant departments." },
              { icon: UserPlus, step: "03", title: "Resolution", desc: "Receive an official response and track the progress in real-time on your dashboard." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-600/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">{item.step}. {item.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - High Density */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 lg:p-16 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 -skew-x-12 translate-x-1/4 pointer-events-none" />
             
             <div className="relative z-10 max-w-xl">
                <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
                   Ready to Make <br />a Difference?
                </h2>
                <p className="text-slate-400 text-base font-medium leading-relaxed mb-10">
                   Join the official LASUSTECH support network today. Your feedback is essential for continuous campus improvement.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                   <button 
                     onClick={() => setIsReportModalOpen(true)}
                     className="btn-primary py-3 px-8"
                   >
                     Submit a Report
                   </button>
                   <Link 
                     to="/register" 
                     className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-white/20 text-white text-xs font-semibold hover:bg-white/10 transition-all"
                   >
                     Create Account
                     <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </main>
  );
};

export default Home;

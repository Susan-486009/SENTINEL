import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeatureCards from '../components/FeatureCards';
import ReportModal from '../components/ReportModal';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Target, TrendingUp, Users, 
  ArrowRight, Shield, Heart, Flag, CheckCircle2,
  BookOpen, HelpCircle, UserPlus
} from 'lucide-react';
import campusImg from '../assets/lasustech_campus_scene.png';

const Home = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <Hero onReportClick={() => setIsReportModalOpen(true)} />

      {/* About Us & Mission Section */}
      <section id="about" className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60" />
              <img 
                src={campusImg} 
                alt="LASUSTECH Campus life" 
                className="relative z-10 w-full h-[500px] object-cover rounded-[3rem] shadow-2xl border-8 border-white"
              />
              <div className="absolute -bottom-10 -right-10 bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-2xl hidden md:block">
                 <Heart className="w-10 h-10 mb-4" />
                 <p className="text-2xl font-black italic">Student-First<br />Support.</p>
              </div>
            </motion.div>

            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
                <Flag className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Our Official Mission</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
                Providing a <span className="text-blue-600">Secure Voice</span> for Every LASUSTECH Student.
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
                At LASUSTECH, we believe that every student's concern deserves professional and timely attention. This portal was built to bridge the gap between students and the university administration, ensuring that help is always just a few clicks away.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Our Vision", desc: "To create a campus environment where transparency and mutual respect thrive." },
                  { title: "Our Commitment", desc: "We guarantee that every valid report is reviewed by official authorities." },
                  { title: "Your Privacy", desc: "Your identity is protected through our secure reporting protocols." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Breakdown */}
      <section className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-6">Simple 3-Step Process</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              How the Support <br />Portal Works.
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: BookOpen, step: "01", title: "Document Issue", desc: "Fill out our simple form with details of your concern. You can also upload photos or documents." },
              { icon: HelpCircle, step: "02", title: "Expert Review", desc: "Our specialized teams review your case and coordinate with the necessary university departments." },
              { icon: UserPlus, step: "03", title: "Resolution", desc: "Receive real-time updates and an official response once your case has been addressed." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-900/5 relative group hover:-translate-y-2 transition-all duration-500"
              >
                <div className="text-7xl font-black text-blue-50 absolute top-8 right-8 group-hover:text-blue-100 transition-colors">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-100">
                  <item.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{item.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-blue-600 rounded-[4rem] p-12 lg:p-24 relative overflow-hidden shadow-2xl shadow-blue-200">
             {/* Decorative Background */}
             <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                <img src="/university_portal_login_1778104480103.png" alt="Overlay" className="w-full h-full object-cover" />
             </div>
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/50 to-transparent" />

             <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight mb-8">
                   Ready to Speak Up <br />for LASUSTECH?
                </h2>
                <p className="text-blue-50 text-xl font-medium leading-relaxed mb-12 opacity-90">
                   Your feedback helps us make our university better for everyone. Create an account or send a report today.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                   <button 
                     onClick={() => setIsReportModalOpen(true)}
                     className="bg-white text-blue-600 px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-50 hover:-translate-y-1 transition-all shadow-xl active:scale-95"
                   >
                     Submit a Report Now
                   </button>
                   <Link 
                     to="/register" 
                     className="flex items-center justify-center gap-3 bg-blue-800 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-900 hover:-translate-y-1 transition-all"
                   >
                     Join Our Community
                     <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>

             <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </main>
  );
};

export default Home;

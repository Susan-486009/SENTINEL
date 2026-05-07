import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, BookOpen, HelpCircle, UserPlus,
  Flag, Heart, Shield, Target, Award, Users
} from 'lucide-react';
import campusImg from '../assets/lasustech_campus_scene.png';

const About = () => {
  return (
    <main className="bg-white pt-24 pb-16 font-sans">
      
      {/* Header Section */}
      <section className="py-16 lg:py-24 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 mb-6">
              <Flag className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Our Official Identity</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-8">
              Lagos State University of <br />
              <span className="text-blue-600">Science and Technology.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              The LASUSTECH Support Portal is a specialized institutional management system designed to bridge the gap between our student body and university administration. We prioritize transparency, security, and rapid resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision - High Density */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            
            <div className="space-y-16">
               <div>
                  <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-4">The Mission</h2>
                  <h3 className="text-3xl font-bold text-slate-900 mb-6">Empowering Student Voices.</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10">
                    To provide a seamless, secure, and professional environment where every student of LASUSTECH can report concerns and receive institutional support without friction.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { icon: Shield, title: "Secure Access", desc: "Institutional-grade data protection for all users." },
                      { icon: Target, title: "Direct Action", desc: "Reports are routed directly to authorized staff." }
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                        <item.icon className="w-5 h-5 text-blue-600 mb-4" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    ))}
                  </div>
               </div>

               <div>
                  <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-4">The Vision</h2>
                  <h3 className="text-3xl font-bold text-slate-900 mb-6">A Culture of Accountability.</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    To establish LASUSTECH as a leader in student welfare and administrative transparency through innovative digital support systems.
                  </p>
               </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/5 rounded-2xl -rotate-2 scale-105 pointer-events-none" />
              <img 
                src={campusImg} 
                alt="LASUSTECH Campus" 
                className="relative z-10 w-full h-[600px] object-cover rounded-2xl shadow-premium border border-slate-200"
              />
              <div className="absolute -bottom-8 -left-8 bg-white border border-slate-200 p-8 rounded-2xl shadow-md hidden md:block max-w-[240px]">
                 <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-6">
                   <Award className="w-5 h-5 text-white" />
                 </div>
                 <p className="text-sm font-bold text-slate-900 leading-tight mb-2">Excellence in Support.</p>
                 <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">LASUSTECH Standard</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Operational Breakdown */}
      <section className="py-20 lg:py-32 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-6">Operational Framework</h2>
              <h3 className="text-4xl font-bold tracking-tight">How we manage resolutions.</h3>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: BookOpen, 
                  title: "Documentation", 
                  desc: "Every ticket is assigned a unique tracking number and categorized for specialized review." 
                },
                { 
                  icon: HelpCircle, 
                  title: "Review Cycle", 
                  desc: "Authorized administrative teams evaluate the report and coordinate with relevant university departments." 
                },
                { 
                  icon: Users, 
                  title: "Resolution", 
                  desc: "Actionable steps are taken to address the issue, and an official response is logged for the user." 
                }
              ].map((item, i) => (
                <div key={i} className="p-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-8">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold mb-4 uppercase tracking-tight">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-10">
              <Heart className="w-8 h-8 text-blue-600" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 mb-8">A Commitment to the Student Body.</h2>
           <p className="text-slate-500 text-base leading-relaxed font-medium mb-12 uppercase tracking-wide">
             The Lagos State University of Science and Technology is dedicated to ensuring that your academic journey is supported by efficient, transparent, and respectful administrative processes. This portal is a testament to that commitment.
           </p>
           <div className="w-24 h-px bg-slate-100 mx-auto" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-8">LASUSTECH Support Team</p>
        </div>
      </section>

    </main>
  );
};

export default About;

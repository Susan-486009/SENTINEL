import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Lock, ArrowUpRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-[#111827] border border-slate-800 p-10 rounded-2xl group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
       <Icon size={120} />
    </div>
    
    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
      <Icon className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
    </div>
    
    <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-tighter">{title}</h3>
    <p className="text-slate-600 text-[11px] font-bold leading-relaxed mb-8 uppercase tracking-widest italic opacity-80">
      {description}
    </p>
    
    <button className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] italic group-hover:gap-4 transition-all">
      Access_Protocol <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);

const FeatureCards = () => {
  const features = [
    {
      icon: Activity,
      title: "Active Monitoring",
      description: "Real-time trajectory tracking for all logged incidents with direct encrypted feedback loops.",
      delay: 0.1
    },
    {
      icon: Lock,
      title: "Identity Stealth",
      description: "Cryptographic anonymity protocols ensuring whistleblower protection at the architectural level.",
      delay: 0.2
    },
    {
      icon: Shield,
      title: "System Integrity",
      description: "Immutable audit logs verified by institutional oversight nodes for absolute resolution accountability.",
      delay: 0.3
    }
  ];

  return (
    <section id="features" className="py-32 bg-[#0B1120] relative border-t border-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1 h-1 rounded-full bg-blue-500" />
             <span className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase italic">Capabilities_Deployment</span>
          </div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Network Infrastructure</h2>
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">Advanced tools for institutional transparency and student empowerment.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;

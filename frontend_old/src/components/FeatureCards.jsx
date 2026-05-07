import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Lock, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white border border-slate-100 p-10 rounded-3xl group hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-8 text-blue-50 group-hover:text-blue-100 transition-colors">
       <Icon size={120} />
    </div>
    
    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-all duration-500">
      <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
    </div>
    
    <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{title}</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
      {description}
    </p>
    
    <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
      Learn Protocol
      <ArrowUpRight className="w-3.5 h-3.5" />
    </div>
  </motion.div>
);

const FeatureCards = () => {
  const features = [
    {
      icon: Shield,
      title: "Encrypted Privacy",
      description: "Every report is protected with military-grade encryption, ensuring your identity remains secure throughout the resolution process.",
      delay: 0.1
    },
    {
      icon: Activity,
      title: "Live Monitoring",
      description: "Real-time updates on case progression. Track your report from submission to final institutional resolution with total transparency.",
      delay: 0.2
    },
    {
      icon: Zap,
      title: "Rapid Response",
      description: "Our automated dispatch system ensures your voice reaches the right authorities immediately, cutting through traditional bureaucracy.",
      delay: 0.3
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature, idx) => (
        <FeatureCard key={idx} {...feature} />
      ))}
    </div>
  );
};

export default FeatureCards;

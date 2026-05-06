import React from 'react';
import { motion } from 'framer-motion';
import complaintImg from '../assets/illustrations/complaint.png';
import securityImg from '../assets/illustrations/security.png';
import adminImg from '../assets/illustrations/admin.png';

const FeatureCard = ({ image, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="card group hover:scale-[1.02]"
  >
    <div className="p-2">
      <div className="bg-slate-50 rounded-xl overflow-hidden mb-6 aspect-video flex items-center justify-center">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>
    </div>
    <div className="px-6 pb-8">
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6">
        {description}
      </p>
      <button className="text-primary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
        Learn More <span className="text-lg">→</span>
      </button>
    </div>
  </motion.div>
);

const FeatureCards = () => {
  const features = [
    {
      image: complaintImg,
      title: "Report An Issue",
      description: "Tell us what's wrong using our simple form. You can add pictures and see updates live.",
      delay: 0.1
    },
    {
      image: securityImg,
      title: "Safe & Private",
      description: "Your information is safe with us. We keep your reports private and secure at every step.",
      delay: 0.2
    },
    {
      image: adminImg,
      title: "School Support",
      description: "Our dedicated staff members see your reports and work quickly to fix them for you.",
      delay: 0.3
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Sentinel makes it easy to report problems, check updates, and get results from the school.
          </p>
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

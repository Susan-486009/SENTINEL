import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, Lock } from 'lucide-react';

const Legal = () => {
  const location = useLocation();
  const isPrivacy = location.pathname === '/privacy';

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 mb-6">
            {isPrivacy ? <Lock className="w-3.5 h-3.5 text-blue-600" /> : <Scale className="w-3.5 h-3.5 text-blue-600" />}
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Institutional Protocol</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {isPrivacy ? 'Data Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
            Last Updated: May 6, 2026
          </p>
        </div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 lg:p-12 space-y-12"
        >
          {isPrivacy ? (
            <>
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Data Collection</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  We collect your matriculation number, name, and official LASUSTECH email to verify your identity. This ensure all reports are legitimate and can be addressed by the university administration.
                </p>
              </section>
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Anonymous Reporting</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  If you choose "Stay Anonymous," your identity will be hidden from staff and faculty. However, your data remains encrypted in our database for audit purposes to prevent portal abuse.
                </p>
              </section>
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Data Security</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  All transmissions are encrypted using industrial-grade protocols. We do not share your data with third-party vendors outside of the university's official support ecosystem.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Acceptance of Terms</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  By accessing the LASUSTECH Support Portal, you agree to comply with the university's code of conduct and the specific protocols outlined for institutional reporting.
                </p>
              </section>
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Responsible Reporting</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Users are expected to provide accurate, truthful, and respectful information. Malicious reporting or portal abuse may result in disciplinary action according to university statutes.
                </p>
              </section>
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Service Availability</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  While we strive for 24/7 availability, the university reserves the right to suspend portal access for maintenance or security updates.
                </p>
              </section>
            </>
          )}

          <div className="pt-12 border-t border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
               Lagos State University of Science and Technology <br />
               Office of Digital Infrastructure
             </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Legal;

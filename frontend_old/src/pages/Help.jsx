import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Mail, Phone, MessageSquare, BookOpen, Clock } from 'lucide-react';

const Help = () => {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 mb-6">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Support Center</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">How can we help you?</h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Official Support Resources</p>
        </div>

        {/* Contact Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Mail, title: "Email Support", contact: "support@lasustech.edu.ng", desc: "For technical issues with the portal." },
            { icon: MessageSquare, title: "Student Affairs", contact: "student.help@lasustech.edu.ng", desc: "For guidance on reporting specific concerns." }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
                <item.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">{item.title}</h3>
              <p className="text-blue-600 text-xs font-bold mb-4">{item.contact}</p>
              <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
             <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Common Questions</h2>
             </div>
             <p className="text-xs text-slate-500 font-medium">Quick answers to institutional processes.</p>
          </div>
          
          <div className="divide-y divide-slate-100">
            {[
              { q: "How long does a resolution take?", a: "Typically 3-5 working days depending on the complexity of the concern." },
              { q: "Is my report really anonymous?", a: "Yes. Choosing 'Stay Anonymous' hides your name from the staff reviewing the case." },
              { q: "Can I edit a report after submission?", a: "No. For security and integrity, reports cannot be edited once logged." }
            ].map((faq, i) => (
              <div key={i} className="p-8 hover:bg-slate-50 transition-colors">
                <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-tight">{faq.q}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Hours: 8AM - 4PM (WAT)</span>
           </div>
        </div>
      </div>
    </main>
  );
};

export default Help;

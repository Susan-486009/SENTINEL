import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, Clock, CheckCircle2, 
  AlertCircle, ArrowRight, FileText, Activity,
  Lock, Globe, Shield, SearchIcon, GraduationCap
} from 'lucide-react';
import { complaintService } from '../services/api';
import { toast } from 'react-toastify';

const StatusNode = ({ active, label, date, icon: Icon, isLast }) => (
  <div className="flex gap-10">
    <div className="flex flex-col items-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 ${
        active 
          ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' 
          : 'bg-white border-slate-100 text-slate-200'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      {!isLast && (
        <div className={`w-1 h-20 transition-colors duration-1000 ${
          active ? 'bg-blue-600' : 'bg-slate-100'
        }`} />
      )}
    </div>
    <div className="pt-3">
      <p className={`text-xs font-black uppercase tracking-widest mb-2 ${active ? 'text-slate-900' : 'text-slate-300'}`}>
        {label}
      </p>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{date || 'Waiting for Update'}</p>
    </div>
  </div>
);

const TrackComplaint = () => {
  const [refId, setRefId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!refId.trim()) return;
    setLoading(true);
    try {
      const data = await complaintService.track(refId);
      setComplaint(data);
    } catch (err) {
      toast.error('Ticket number not found in our records.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { label: 'Received', key: 'pending', icon: FileText },
    { label: 'Under Review', key: 'investigating', icon: Activity },
    { label: 'Resolved', key: 'resolved', icon: CheckCircle2 },
  ];

  const getStatusIndex = (status) => {
    const map = { pending: 0, investigating: 1, resolved: 2 };
    return map[status] ?? 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl opacity-60" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 mb-10"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Support Tracking</span>
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-8">Track Your Ticket</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl mx-auto uppercase tracking-widest">
            Enter your official ticket number to see the current status of your report.
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-3 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-100 mb-20"
        >
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative group">
              <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                <SearchIcon className="w-6 h-6" />
              </div>
              <input
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="LAS/ST-XXXXXXXX"
                className="input-premium pl-20"
              />
            </div>
            <button
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-4 disabled:opacity-50 hover:-translate-y-1 active:scale-95"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Find Ticket'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid lg:grid-cols-3 gap-10"
            >
              {/* Left: Status Timeline */}
              <div className="lg:col-span-1 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-12">Ticket Status</h4>
                <div className="space-y-0">
                  {statusSteps.map((step, idx) => (
                    <StatusNode
                      key={step.key}
                      icon={step.icon}
                      label={step.label}
                      active={getStatusIndex(complaint.status) >= idx}
                      isLast={idx === statusSteps.length - 1}
                      date={getStatusIndex(complaint.status) >= idx ? new Date(complaint.createdAt).toLocaleDateString() : null}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Details Card */}
              <div className="lg:col-span-2 bg-white p-12 lg:p-16 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 text-blue-50/50 pointer-events-none">
                   <ShieldCheck size={200} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-16">
                    <div>
                      <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        {complaint.title}
                      </h4>
                      <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-5 py-2 rounded-full inline-block border border-blue-100">
                        NUMBER: {complaint.referenceId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-16">
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</p>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-wide">{complaint.category}</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Status</p>
                      <p className="text-sm font-black text-blue-600 uppercase tracking-wide">{complaint.status}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ticket Description</p>
                    <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-slate-600 text-sm leading-relaxed font-bold uppercase tracking-tight">
                      "{complaint.description}"
                    </div>
                  </div>

                  {complaint.resolution && (
                    <div className="mt-12 space-y-4">
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest ml-2">University Response</p>
                      <div className="p-10 bg-green-50 rounded-[2.5rem] border border-green-100 text-green-700 text-sm leading-relaxed font-bold uppercase tracking-tight">
                        {complaint.resolution}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!complaint && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <div className="w-28 h-28 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center mx-auto mb-10 shadow-sm">
               <Globe className="w-12 h-12 text-slate-100" />
            </div>
            <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Awaiting Ticket Query</p>
          </motion.div>
        )}
        
        <p className="text-center mt-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           Lagos State University of Science and Technology
        </p>
      </div>
    </div>
  );
};

export default TrackComplaint;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, Clock, CheckCircle2, 
  AlertCircle, ArrowRight, FileText, Activity,
  Lock, Globe, Shield
} from 'lucide-react';
import { complaintService } from '../services/api';
import { toast } from 'react-toastify';

const StatusNode = ({ active, label, date, icon: Icon, isLast }) => (
  <div className="flex gap-6">
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
        active 
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
          : 'bg-white border-slate-100 text-slate-300'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      {!isLast && (
        <div className={`w-0.5 h-16 transition-colors duration-500 ${
          active ? 'bg-blue-600' : 'bg-slate-100'
        }`} />
      )}
    </div>
    <div className="pt-2">
      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${active ? 'text-slate-900' : 'text-slate-300'}`}>
        {label}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date || 'Awaiting Protocol'}</p>
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
      toast.error('Identity Reference not found in Sentinel logs.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { label: 'Report_Logged', key: 'pending', icon: FileText },
    { label: 'Investigation_Active', key: 'investigating', icon: Activity },
    { label: 'Resolution_Node', key: 'resolved', icon: CheckCircle2 },
  ];

  const getStatusIndex = (status) => {
    const map = { pending: 0, investigating: 1, resolved: 2 };
    return map[status] ?? 0;
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Sentinel Query Node</span>
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">Track Your Case</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl mx-auto uppercase tracking-wide">
            Enter your unique reference ID to query the status of your report in the transparency registry.
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 mb-16"
        >
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="SENT-XXXXXXXXXXXX"
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-black uppercase tracking-widest placeholder:text-slate-300"
              />
            </div>
            <button
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Query Registry'}
              <ArrowRight className="w-4 h-4" />
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
              <div className="lg:col-span-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Resolution_Trajectory</h4>
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
              <div className="lg:col-span-2 bg-white p-10 lg:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-blue-50/50">
                   <ShieldCheck size={180} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {complaint.title}
                      </h4>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full inline-block">
                        REF: {complaint.referenceId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Category Node</p>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{complaint.category}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Protocol</p>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-wide">{complaint.status}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Official Log Entry</p>
                    <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed font-medium">
                      "{complaint.description}"
                    </div>
                  </div>

                  {complaint.resolution && (
                    <div className="mt-10">
                      <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-4 ml-1">Resolution Protocol</p>
                      <div className="p-8 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-sm leading-relaxed font-bold">
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
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-8">
               <Globe className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Identity Query</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;

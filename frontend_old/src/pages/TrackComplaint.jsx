import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, CheckCircle2, 
  ArrowRight, FileText, Activity,
  GraduationCap, SearchIcon, Clock
} from 'lucide-react';
import { complaintService } from '../services/api';
import { toast } from 'react-toastify';

const StatusNode = ({ active, label, date, icon: Icon, isLast }) => (
  <div className="flex gap-6">
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 border ${
        active 
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
          : 'bg-white border-slate-200 text-slate-200'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      {!isLast && (
        <div className={`w-px h-12 transition-colors duration-500 ${
          active ? 'bg-blue-600' : 'bg-slate-200'
        }`} />
      )}
    </div>
    <div className="pt-1.5">
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${active ? 'text-slate-900' : 'text-slate-300'}`}>
        {label}
      </p>
      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{date || 'Awaiting update'}</p>
    </div>
  </div>
);

const TrackComplaint = () => {
  const location = useLocation();
  const [refId, setRefId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-search if ref passed in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlRef = params.get('ref');
    if (urlRef) {
      setRefId(urlRef);
      handleTrack(null, urlRef);
    }
  }, [location]);

  const handleTrack = async (e, forcedRef = null) => {
    if (e) e.preventDefault();
    const query = (forcedRef || refId).trim().toUpperCase(); // Smart Input Handling
    if (!query) return;

    setLoading(true);
    try {
      const data = await complaintService.track(query);
      setComplaint(data);
    } catch (err) {
      setComplaint(null);
      toast.error('Record not found');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { label: 'Received', key: 'pending', icon: FileText },
    { label: 'Reviewing', key: 'investigating', icon: Activity },
    { label: 'Resolved', key: 'resolved', icon: CheckCircle2 },
  ];

  const getStatusIndex = (status) => {
    const map = { pending: 0, investigating: 1, resolved: 2 };
    return map[status] ?? 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Compact Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 mb-6">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Case Tracking Node</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Official Ticket Query</h1>
          <p className="text-slate-500 text-xs font-medium max-w-md mx-auto uppercase tracking-widest">
            Enter your official support number to monitor resolution progress.
          </p>
        </div>

        {/* Refined Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="flex-1 relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input
                value={refId}
                onChange={(e) => setRefId(e.target.value.toUpperCase())}
                placeholder="LAS/ST-XXXXXXXX"
                className="input-professional pl-11"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Search'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Results - High Density Grid */}
        <AnimatePresence mode="wait">
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Left: Timeline Panel */}
              <div className="lg:col-span-1 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Resolution Path</h4>
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

              {/* Right: Detailed Analysis Panel */}
              <div className="lg:col-span-2 bg-white p-8 lg:p-10 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-2 uppercase">
                      {complaint.title}
                    </h4>
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                      REF: {complaint.referenceId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-md">
                     <Clock className="w-3 h-3 text-slate-400" />
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active State</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Classification</p>
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{complaint.category}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Node</p>
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">{complaint.status}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Case Description</p>
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs leading-relaxed font-medium">
                    "{complaint.description}"
                  </div>
                </div>

                {complaint.resolution && (
                  <div className="mt-8 space-y-3">
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest ml-1">Official Resolution</p>
                    <div className="p-6 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs leading-relaxed font-medium">
                      {complaint.resolution}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professional Empty State */}
        {!complaint && !loading && (
          <div className="text-center py-20 border-t border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
               <Clock className="w-5 h-5 text-slate-100" />
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Case Query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;

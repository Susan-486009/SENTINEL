import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Clock, ShieldCheck, AlertTriangle, XCircle, ExternalLink, Calendar } from 'lucide-react';
import { complaintService } from '../services/api';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const statusConfig = {
  pending:   { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
  reviewing: { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-100',   icon: ShieldCheck },
  resolved:  { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700 border-green-100', icon: ShieldCheck },
  rejected:  { dot: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border-red-100',     icon: XCircle },
};

const TrackComplaint = () => {
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.refId || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await complaintService.track(query.trim());
      setResults(data ? [data] : []);
    } catch (err) {
      toast.error('Search failed. Verify the Protocol ID.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.refId) {
      handleSearch();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="mb-12 text-center">
             <div className="flex items-center justify-center gap-2 mb-3">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase italic">Audit Query System</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Track Protocol</h1>
            <p className="text-slate-600 font-bold mt-3 text-[10px] uppercase tracking-widest italic">Monitor the investigation trajectory in real-time.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-16">
            <div className="flex items-center gap-4 bg-[#111827] border border-slate-800 rounded-2xl px-6 py-4 shadow-2xl shadow-blue-900/5 focus-within:border-blue-500/40 transition-all group">
              <Search className="w-5 h-5 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="INPUT PROTOCOL ID (e.g. SENT-XXXXXX)"
                className="flex-1 text-xs font-black tracking-widest focus:outline-none bg-transparent text-white placeholder:text-slate-800 uppercase"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20 italic"
              >
                {loading ? 'Initializing...' : 'Query Database'}
              </button>
            </div>
          </form>

          {/* Results Area */}
          <div className="space-y-6">
            {!loading && results.length === 0 && query && (
               <div className="text-center py-24 bg-[#111827]/50 rounded-2xl border border-slate-800 border-dashed">
                  <AlertTriangle className="w-12 h-12 text-slate-800 mx-auto mb-6" />
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Protocol record not found in central database</p>
               </div>
            )}

            {results.map((c) => {
              const isOpen = expanded === (c.id || c._id);
              const s = statusConfig[c.status] || statusConfig.pending;
              const StatusIcon = s.icon;

              return (
                <div key={c.id || c._id} className="bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden group">
                  <button
                    onClick={() => setExpanded(isOpen ? null : (c.id || c._id))}
                    className="w-full flex items-center justify-between px-8 py-8 text-left hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)] ${s.dot} animate-pulse`} />
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight italic uppercase group-hover:text-blue-500 transition-colors">{c.title}</h3>
                        <p className="text-[9px] font-black text-slate-600 mt-1 uppercase tracking-widest italic">
                          REF: <span className="text-blue-500">#{c.reference_id?.toUpperCase()}</span> • {c.category?.toUpperCase().replace('-', '_')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0 ml-4">
                      <span className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-opacity-20 shadow-sm italic ${s.badge.replace('bg-opacity-10', 'bg-opacity-5')}`}>
                        {c.status?.toUpperCase()}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-700 transition-all duration-500 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-10 border-t border-slate-800 pt-8 bg-slate-950/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="flex gap-5">
                               <div className="shrink-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                 <Calendar className="w-5 h-5 text-slate-700" />
                               </div>
                               <div>
                                 <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1 italic">Log_Timestamp</p>
                                 <p className="text-xs font-black text-white uppercase italic">{new Date(c.created_at).toLocaleString()}</p>
                               </div>
                             </div>

                             <div className="flex gap-5">
                               <div className="shrink-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                 <StatusIcon className={`w-5 h-5 ${s.dot.replace('bg-', 'text-')}`} />
                               </div>
                               <div className="flex-1">
                                 <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1 italic">Audit_Feedback</p>
                                 <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase italic">
                                   {c.status === 'pending' ? 'PROTOCOL QUEUED. AWAITING ASSIGNMENT TO MONITORING OFFICER.' : 
                                    c.status === 'reviewing' ? 'INVESTIGATION IN PROGRESS. DATA PACKETS ARE BEING VERIFIED.' :
                                    c.status === 'resolved' ? 'RESOLUTION REACHED. SYSTEM UPDATED. AUDIT LOGS FINALIZED.' :
                                    'PROTOCOL REJECTED. INSUFFICIENT DATA OR POLICY VIOLATION.'}
                                 </p>
                               </div>
                             </div>
                          </div>
                             
                          <div className="mt-10 pt-8 border-t border-slate-800/60 flex justify-between items-center">
                             <div className="flex gap-3">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-950" />
                                <span className="text-[8px] font-black text-slate-800 uppercase tracking-[0.3em] italic leading-none">Security Hash: {c.reference_id?.slice(0, 10)}...</span>
                             </div>
                             <p className="text-[8px] font-black text-slate-800 uppercase tracking-widest italic opacity-50">Sentinel_Audit_Log_Authorized</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] mt-24 opacity-30 italic">
            SENTINEL_QUERY_INTERFACE • v2.5
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackComplaint;

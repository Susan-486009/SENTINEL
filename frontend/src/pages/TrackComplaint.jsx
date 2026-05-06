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
      // Find by reference ID
      const data = await complaintService.track(query.trim());
      setResults(data ? [data] : []);
      if (!data) toast.info('No complaint found with that ID.');
    } catch (err) {
      toast.error('Search failed. Please ensure the Ref ID is correct.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if refId is passed from submission
  useEffect(() => {
    if (location.state?.refId) {
      handleSearch();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-10 text-center">
            <span className="text-[10px] font-black tracking-[0.4em] text-primary uppercase italic mb-3 block">Status Checker</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">View My Reports</h1>
            <p className="text-slate-500 font-medium mt-2">See the progress of your reports in real-time.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-12">
            <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-[2.5rem] px-8 py-5 shadow-2xl shadow-slate-200/50 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20 transition-all">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Report ID (e.g. CMP-102934)"
                className="flex-1 text-sm font-bold focus:outline-none bg-transparent text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {loading ? 'Searching...' : 'Find Report'}
              </button>
            </div>
          </form>

          {/* Results Area */}
          <div className="space-y-6">
            {!loading && results.length === 0 && query && (
               <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching report found</p>
               </div>
            )}

            {results.map((c) => {
              const isOpen = expanded === c.id;
              const s = statusConfig[c.status] || statusConfig.pending;
              const StatusIcon = s.icon;

              return (
                <div key={c.id} className="card-premium overflow-hidden border-none shadow-xl shadow-slate-200/40">
                  <button
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="w-full flex items-center justify-between px-10 py-10 text-left hover:bg-slate-50/30 transition-colors"
                  >
                    <div className="flex items-start gap-7">
                      <div className={`mt-2 w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ${s.dot} animate-pulse`} />
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{c.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          Report ID: <span className="text-primary font-black">#{c.reference_id}</span> • {c.category.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0 ml-4">
                      <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-full border-2 shadow-sm ${s.badge}`}>
                        {c.status === 'pending' ? 'Waiting' : c.status === 'reviewing' ? 'Checking' : c.status === 'resolved' ? 'Fixed' : c.status}
                      </span>
                      <ChevronDown className={`w-6 h-6 text-slate-300 transition-all duration-500 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-10 pb-12 border-t border-slate-50 pt-10 bg-slate-50/20">
                          {/* Timeline/Audit Trail */}
                          <div className="space-y-10">
                             <div className="flex gap-6">
                               <div className="shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                 <Calendar className="w-6 h-6 text-slate-400" />
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Submitted On</p>
                                 <p className="text-sm font-black text-slate-700">{new Date(c.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                               </div>
                             </div>

                             <div className="flex gap-6">
                               <div className="shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                 <StatusIcon className={`w-6 h-6 ${s.dot.replace('bg-', 'text-')}`} />
                               </div>
                               <div className="flex-1">
                                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5">Current Status</p>
                                 <p className="text-sm font-bold text-slate-600 leading-relaxed max-w-md">
                                   {c.status === 'pending' ? 'Your report has been received and is waiting for a staff member to pick it up.' : 
                                    c.status === 'reviewing' ? 'A staff member is currently looking into your report details.' :
                                    c.status === 'resolved' ? 'This issue has been fixed! Please check your email for any final notes.' :
                                    'This report could not be processed at this time. Please check our guidelines.'}
                                 </p>
                               </div>
                             </div>
                             
                             <div className="mt-10 pt-10 border-t border-slate-100 flex justify-between items-center">
                               <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-4 transition-all">
                                 View Full Report History <ExternalLink className="w-3.5 h-3.5" />
                               </button>
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Encrypted Connection</p>
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-20 opacity-50">
            SENTINEL v1.5 • LASUSTECH
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackComplaint;

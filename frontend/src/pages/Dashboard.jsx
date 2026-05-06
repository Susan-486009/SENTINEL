import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Clock, CheckCircle, AlertCircle, 
  ArrowRight, MessageSquare, Plus, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/api';

const StatMini = ({ icon: Icon, label, value, color, loading }) => (
  <div className="bg-[#111827] rounded-xl p-5 flex items-center gap-4 border border-slate-800/60 shadow-xl group hover:border-blue-500/30 transition-all">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      {loading ? (
        <div className="h-4 w-12 bg-slate-800 animate-pulse rounded" />
      ) : (
        <p className="text-xl font-black text-white leading-none tracking-tighter italic">{value}</p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const data = await complaintService.getMine();
        setComplaints(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, []);

  const stats = {
    total: (complaints || []).length,
    pending: (complaints || []).filter(c => c.status === 'pending').length,
    resolved: (complaints || []).filter(c => c.status === 'resolved').length,
    reviewing: (complaints || []).filter(c => c.status === 'in_review' || c.status === 'reviewing').length,
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black tracking-[0.3em] text-blue-500 uppercase italic">Sentinel Student Interface</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Greeting, <span className="text-blue-500">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest italic">
              Portal Active • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Main Content: Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Report Audit Trail</h3>
              <Link to="/track" className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline">Full History</Link>
            </div>

            <div className="bg-[#111827] rounded-2xl shadow-2xl border border-slate-800/60 overflow-hidden">
              <div className="divide-y divide-slate-800/50">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="px-8 py-6 h-20 bg-slate-900/20 animate-pulse border-b border-slate-800" />)
                ) : complaints.length === 0 ? (
                  <div className="py-24 flex flex-col items-center text-center px-10">
                    <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 border border-slate-800">
                      <MessageSquare className="w-8 h-8 text-slate-800" />
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tight uppercase italic">No Active Protocols</h4>
                    <p className="text-slate-500 text-[10px] mt-2 max-w-[200px] font-black uppercase tracking-widest italic">Everything is currently synchronized. No issues found.</p>
                    <Link to="/submit" className="mt-8 btn-primary px-8 py-3 text-[9px]">Initiate Report</Link>
                  </div>
                ) : (
                  complaints.slice(0, 6).map((c, idx) => (
                    <motion.div 
                      key={c.id || c._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-8 py-6 flex items-center justify-between hover:bg-slate-800/20 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 group-hover:scale-105 transition-transform
                          ${c.status === 'resolved' ? 'bg-green-500/5' : 'bg-slate-950'}`}>
                          <ClipboardList className={`w-5 h-5 ${c.status === 'resolved' ? 'text-green-500' : 'text-blue-500'}`} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white tracking-tight group-hover:text-blue-500 transition-colors line-clamp-1 uppercase italic">{c.title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'pending' ? 'bg-amber-500' : c.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                              ID: {c.reference_id?.slice(-8)} • {new Date(c.created_at || c.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link 
                        to="/track" 
                        state={{ refId: c.reference_id }}
                        className="p-3 rounded-lg bg-slate-950 text-slate-700 hover:text-blue-500 hover:bg-slate-900 border border-slate-800 transition-all"
                      >
                         <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
               <div className="relative z-10">
                 <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">Technical Support Required?</h4>
                 <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest max-w-sm mb-8 leading-relaxed italic opacity-80">
                   Our AI Assistant is available 24/7 to guide you through university policies and protocols.
                 </p>
                 <button className="bg-white text-blue-600 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg">
                   Launch Sentinel AI
                 </button>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic mb-6 px-2">Core Metrics</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <StatMini icon={ClipboardList} label="Logged Items" value={stats.total} color="bg-blue-600" loading={loading} />
                <StatMini icon={Clock}         label="Open Queue"    value={stats.pending} color="bg-amber-600" loading={loading} />
                <StatMini icon={CheckCircle}   label="Resolved Fix"  value={stats.resolved} color="bg-green-600" loading={loading} />
              </div>
            </div>

            <div className="bg-[#111827] rounded-2xl p-8 border border-slate-800 shadow-2xl">
              <h4 className="text-[9px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3 italic">
                <Zap className="w-4 h-4 text-amber-500" /> Security Tip
              </h4>
              <div className="space-y-6">
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic uppercase tracking-tight">
                  "Maintain system integrity. Always use Anonymous Mode for sensitive reports to ensure identity protection."
                </p>
                <div className="pt-6 border-t border-slate-800">
                   <Link to="/submit" className="flex items-center justify-between group">
                     <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">New Protocol</span>
                     <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center group-hover:translate-x-1 transition-transform border border-blue-500/20">
                        <Plus className="w-4 h-4" />
                     </div>
                   </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] rounded-2xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mb-4 border border-slate-800">
                 <AlertCircle className="w-6 h-6 text-slate-700" />
               </div>
               <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic">System Integrity</p>
               <p className="text-[8px] text-green-500 font-black uppercase mt-1.5 tracking-widest">Operational • v1.5</p>
            </div>
          </div>

        </div>

        <p className="text-center text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] mt-24 opacity-30 italic">
          SENTINEL MONITORING • LASUSTECH INFRASTRUCTURE
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

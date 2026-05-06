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
  <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      {loading ? (
        <div className="h-4 w-12 bg-slate-100 animate-pulse rounded" />
      ) : (
        <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
      )}
    </div>
  </div>
);

const SkeletonItem = () => (
  <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 animate-pulse">
    <div className="flex items-center gap-5 w-full">
      <div className="w-12 h-12 rounded-2xl bg-slate-100" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-1/3 bg-slate-100 rounded-lg" />
        <div className="h-2 w-1/4 bg-slate-50 rounded-lg" />
      </div>
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
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Simple Header */}
        <div className="mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
              Portal Overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content: Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Report Activity Feed</h3>
              <Link to="/track" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View History</Link>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {loading ? (
                  [1, 2, 3].map(i => <SkeletonItem key={i} />)
                ) : complaints.length === 0 ? (
                  <div className="py-24 flex flex-col items-center text-center px-10">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                      <MessageSquare className="w-8 h-8 text-slate-200" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">No active reports</h4>
                    <p className="text-slate-400 text-xs mt-2 max-w-[200px] font-medium leading-relaxed">Everything looks clear. Need to report something?</p>
                    <Link to="/submit" className="mt-8 btn-primary px-8 py-3 text-[10px]">Create Report</Link>
                  </div>
                ) : (
                  complaints.slice(0, 6).map((c, idx) => (
                    <motion.div 
                      key={c.id || c._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform
                          ${c.status === 'resolved' ? 'bg-green-50' : 'bg-slate-50'}`}>
                          <ClipboardList className={`w-5 h-5 ${c.status === 'resolved' ? 'text-green-500' : 'text-primary'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors line-clamp-1">{c.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'pending' ? 'bg-amber-400' : c.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              ID: {c.reference_id?.slice(-6)} • {new Date(c.created_at || c.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link 
                        to="/track" 
                        state={{ refId: c.reference_id }}
                        className="p-3 rounded-xl bg-slate-50 text-slate-300 hover:text-primary hover:bg-white hover:shadow-md transition-all"
                      >
                         <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
               <div className="relative z-10">
                 <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">Need immediate help?</h4>
                 <p className="text-blue-100 text-xs font-medium max-w-sm mb-6 leading-relaxed">
                   Our AI Assistant is available 24/7 to guide you through university policies and reporting procedures.
                 </p>
                 <button className="bg-white text-primary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                   Chat with Sentinel AI
                 </button>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Quick Stats</h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <StatMini icon={ClipboardList} label="All Reports" value={stats.total} color="bg-primary" loading={loading} />
              <StatMini icon={Clock}         label="Awaiting"     value={stats.pending} color="bg-amber-500" loading={loading} />
              <StatMini icon={CheckCircle}   label="Resolved"     value={stats.resolved} color="bg-green-500" loading={loading} />
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Privacy Shield Tip
              </h4>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                  "Always use Anonymous Mode for sensitive reports to ensure your identity remains protected under University Policy 4.2."
                </p>
                <div className="pt-4 border-t border-slate-50">
                   <Link to="/submit" className="flex items-center justify-between group">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Report</span>
                     <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <Plus className="w-4 h-4" />
                     </div>
                   </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
               <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Status</p>
                  <p className="text-[9px] text-green-500 font-bold uppercase mt-1">Operational • v1.5</p>
               </div>
            </div>
          </div>

        </div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-20 opacity-40">
          LASUSTECH MONITORING SYSTEM
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

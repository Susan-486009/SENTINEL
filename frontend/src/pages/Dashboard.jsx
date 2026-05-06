import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Clock, CheckCircle, AlertCircle, 
  ArrowRight, MessageSquare, Plus, Zap, TrendingUp, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/api';

const StatMini = ({ icon: Icon, label, value, color, loading }) => (
  <div className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-slate-100 shadow-xl shadow-blue-900/5 group hover:border-blue-500/20 transition-all">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
      {loading ? (
        <div className="h-5 w-16 bg-slate-100 animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{value}</p>
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
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase">Student Command Center</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Welcome, <span className="text-blue-600">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">
              System Active • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          <Link
            to="/submit"
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Official Report
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Main Content: Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity Log</h3>
              <Link to="/track" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Full Audit History</Link>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="px-8 py-8 h-24 bg-slate-50/50 animate-pulse" />)
                ) : complaints.length === 0 ? (
                  <div className="py-24 flex flex-col items-center text-center px-10">
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 border border-blue-100">
                      <MessageSquare className="w-10 h-10 text-blue-200" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">No Active Cases</h4>
                    <p className="text-slate-400 text-xs mt-3 max-w-[280px] font-medium leading-relaxed">
                      Your resolution queue is currently empty. Submit a report to initiate a new case node.
                    </p>
                    <Link to="/submit" className="mt-10 bg-blue-600 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100">Initiate Protocol</Link>
                  </div>
                ) : (
                  complaints.slice(0, 6).map((c, idx) => (
                    <motion.div 
                      key={c.id || c._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-10 py-8 flex items-center justify-between hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300
                          ${c.status === 'resolved' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase italic">{c.title}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                              c.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {c.status}
                            </span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              ID: {c.reference_id?.slice(-8)} • {new Date(c.created_at || c.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link 
                        to="/track" 
                        state={{ refId: c.reference_id }}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-200 shadow-sm flex items-center justify-center transition-all"
                      >
                         <ArrowRight className="w-5 h-5" />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* AI Callout */}
            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-100">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="max-w-md">
                   <div className="flex items-center gap-3 mb-4">
                     <Zap className="w-5 h-5 text-amber-300" />
                     <h4 className="text-xl font-black uppercase tracking-tighter italic">Sentinel Intelligent Query</h4>
                   </div>
                   <p className="text-blue-50 text-[11px] font-medium leading-relaxed opacity-90">
                     Unsure about a policy or the status of your case? Our AI support node is synchronized with current university protocols and available 24/7.
                   </p>
                 </div>
                 <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:-translate-y-1 transition-all shadow-xl whitespace-nowrap">
                   Start AI Discussion
                 </button>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Core Metrics</h3>
              <div className="grid grid-cols-1 gap-5">
                <StatMini icon={ClipboardList} label="Reports Logged" value={stats.total} color="bg-blue-600" loading={loading} />
                <StatMini icon={Clock}         label="Awaiting Audit" value={stats.pending} color="bg-amber-500" loading={loading} />
                <StatMini icon={CheckCircle}   label="Resolved Nodes" value={stats.resolved} color="bg-green-500" loading={loading} />
              </div>
            </div>

            {/* Security Tip */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-blue-900/5">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Shield className="w-5 h-5" />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Trust Protocol</h4>
              </div>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-10 italic">
                "Sentinel is designed for institutional growth. Your participation maintains the integrity of the LASUSTECH ecosystem."
              </p>
              <Link to="/submit" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">New Entry</span>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                   <Plus className="w-5 h-5" />
                </div>
              </Link>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-blue-900/5 flex flex-col items-center text-center">
               <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-6">
                 <TrendingUp className="w-8 h-8 text-blue-600" />
               </div>
               <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Platform Integrity</p>
               <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Operational • v2.4</p>
               </div>
            </div>
          </div>

        </div>

        <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-32 opacity-30">
          SENTINEL PLATFORM • INSTITUTIONAL ACCOUNTABILITY NETWORK
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

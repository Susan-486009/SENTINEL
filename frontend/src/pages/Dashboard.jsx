import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Clock, CheckCircle, AlertCircle, 
  ArrowRight, MessageSquare, Plus, Zap, TrendingUp, Shield,
  GraduationCap, BookOpen, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getUserComplaints();
        setComplaints(data);
        
        const total = data.length;
        const resolved = data.filter(c => c.status === 'resolved').length;
        const pending = data.filter(c => c.status === 'pending' || c.status === 'investigating').length;
        setStats({ total, resolved, pending });
      } catch (err) {
        toast.error('Could not load your records.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'investigating': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
               <GraduationCap className="w-5 h-5 text-blue-600" />
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Official Student Record</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Hello, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Manage your support tickets and track university resolutions.
            </p>
          </motion.div>

          <Link
            to="/submit"
            className="group flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Support Ticket
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { label: 'Total Tickets', val: stats.total, icon: BookOpen, color: 'blue' },
            { label: 'In Progress', val: stats.pending, icon: Activity, color: 'amber' },
            { label: 'Resolved', val: stats.resolved, icon: Shield, color: 'green' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-900/5 group hover:border-blue-600/20 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                stat.color === 'amber' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' :
                'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white'
              }`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900">{stat.val}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
          <div className="p-10 lg:p-12">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Your Recent Tickets</h2>
              <Link to="/track" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-2 group">
                View All History
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-slate-50 rounded-[2rem] animate-pulse" />
                ))}
              </div>
            ) : complaints.length > 0 ? (
              <div className="space-y-6">
                {complaints.map((c, i) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-[2.5rem] border border-slate-50 hover:border-blue-100 hover:bg-blue-50/20 transition-all group"
                  >
                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-blue-600 transition-all">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{c.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged on {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                      <button className="p-3 rounded-full bg-slate-50 text-slate-300 hover:bg-blue-600 hover:text-white transition-all group-hover:scale-110">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <Zap className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">No tickets logged yet</p>
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-4 bg-blue-600 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
                >
                  Create Your First Ticket
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

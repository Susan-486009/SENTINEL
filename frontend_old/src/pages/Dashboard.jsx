import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ClipboardList, Plus, Shield, GraduationCap, 
  Activity, BookOpen, ArrowRight, Zap
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
        toast.error('Unable to sync records');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100';
      case 'investigating': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <GraduationCap className="w-4 h-4 text-blue-600" />
               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Authorized Student Panel</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Manage your active tickets and campus resolutions.</p>
          </div>

          <Link
            to="/submit"
            className="btn-primary flex items-center gap-2 py-2.5 px-6"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </Link>
        </div>

        {/* High Density Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Logs', val: stats.total, icon: BookOpen, color: 'blue' },
            { label: 'Active Progress', val: stats.pending, icon: Activity, color: 'amber' },
            { label: 'Resolved Cases', val: stats.resolved, icon: Shield, color: 'green' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                'bg-green-50 text-green-600'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ticket Activity - Professional Table-like Layout */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Recent Activity Log</h2>
            <Link to="/track" className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-700 transition-colors">
              Full History View
            </Link>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : complaints.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {complaints.map((c, i) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors group rounded-xl"
                  >
                    <div className="flex items-center gap-5 mb-4 sm:mb-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 border border-transparent group-hover:border-slate-200 transition-all">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{c.title}</h4>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(c.status)}`}>
                        {c.status}
                      </span>
                      <Link 
                        to={`/track?ref=${c.referenceId}`}
                        className="p-2 rounded-md hover:bg-white hover:border-slate-200 border border-transparent transition-all"
                      >
                        <ArrowRight className="w-4 h-4 text-slate-300 hover:text-blue-600" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <Zap className="w-7 h-7 text-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">No Active Records Found</h3>
                <p className="text-xs text-slate-500 mb-8 max-w-[200px] mx-auto">Your support dashboard is currently empty. All new tickets will appear here.</p>
                <Link
                  to="/submit"
                  className="btn-primary py-2 px-8 inline-block"
                >
                  Create New Ticket
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ClipboardList, CheckCircle, AlertCircle, 
  Search, Filter, ExternalLink, ShieldAlert,
  ArrowRight, MessageSquare, Clock, X
} from 'lucide-react';
import { complaintService, adminService } from '../services/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/AdminSidebar';

const StatCard = ({ icon: Icon, label, value, color, description }) => (
  <div className="bg-[#1E293B] p-8 rounded-[2.5rem] shadow-2xl shadow-black/20 border border-slate-700/50 flex flex-col justify-between group hover:border-blue-500/50 transition-all duration-500">
    <div>
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-500 mb-2">{label}</p>
      <h4 className="text-4xl font-black text-white tracking-tighter italic">{value}</h4>
    </div>
    <div className="mt-6 flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
      <p className="text-[10px] text-slate-500 font-bold italic">{description}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [query, setQuery]           = useState('');
  const [stats, setStats]           = useState({
    total: 0, pending: 0, resolved: 0, suspicious: 0
  });
  const [selected, setSelected]     = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await complaintService.getAll();
      setComplaints(data);
      
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'pending').length,
        resolved: data.filter(c => c.status === 'resolved').length,
        suspicious: 0 
      });
    } catch (err) {
      toast.error('Failed to load portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await complaintService.updateStatus(id, { 
        status: newStatus,
        comment: adminComment || `Updated by Admin on ${new Date().toLocaleDateString()}`
      });
      toast.success(`Report status updated`);
      setIsModalOpen(false);
      setAdminComment('');
      fetchData();
    } catch (err) {
      toast.error('Update failed.');
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesQuery = 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      c.reference_id.toLowerCase().includes(query.toLowerCase()) ||
      c.complainant_name?.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase italic">Management Portal</span>
              <h1 className="text-4xl font-black text-white mt-2 tracking-tighter uppercase italic">Control Center</h1>
              <p className="text-slate-500 font-medium mt-2">Real-time oversight of student accountability reports.</p>
            </motion.div>
            
            <div className="flex gap-4">
               <button 
                onClick={fetchData}
                className="px-6 py-4 rounded-2xl bg-slate-800 text-[10px] font-black text-white hover:bg-slate-700 transition-all uppercase tracking-widest border border-slate-700"
               >
                 Refresh
               </button>
               <button className="px-6 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest shadow-xl shadow-blue-900/30">
                 System Report
               </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={ClipboardList} label="Total Volume" value={stats.total} color="bg-blue-600" description="Total logged reports" />
            <StatCard icon={Clock}         label="Pending Action" value={stats.pending} color="bg-amber-500" description="Awaiting investigation" />
            <StatCard icon={CheckCircle}   label="Resolved"     value={stats.resolved} color="bg-green-500" description="Successfully closed" />
            <StatCard icon={ShieldAlert}   label="Suspicious"    value={stats.suspicious} color="bg-red-500" description="Detected anomalies" />
          </div>

          {/* List Table */}
          <div className="bg-[#1E293B] rounded-[2.5rem] shadow-2xl shadow-black/40 border border-slate-800 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-800 flex flex-col lg:flex-row gap-8 lg:items-center justify-between bg-slate-800/20">
              <h3 className="text-[10px] font-black text-white tracking-[0.3em] italic uppercase">Accountability Log</h3>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px] flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-3.5 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search Reference, Title or Student..." 
                    className="text-[11px] font-bold bg-transparent text-white focus:outline-none w-full placeholder:text-slate-600" 
                  />
                </div>

                <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-3.5">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)} 
                    className="text-[10px] font-black uppercase tracking-widest bg-transparent text-slate-400 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
                    <th className="px-10 py-6 text-left">Ref Code</th>
                    <th className="px-10 py-6 text-left">Reporter Profile</th>
                    <th className="px-10 py-6 text-left">Subject matter</th>
                    <th className="px-10 py-6 text-left">Current Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <AnimatePresence>
                    {filtered.map((c) => (
                      <motion.tr 
                        key={c.id} 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="group hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-10 py-8">
                          <span className="font-mono text-[10px] font-black text-slate-500 group-hover:text-blue-500 transition-colors">
                            #{c.reference_id?.slice(-8)}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white tracking-tight">
                              {c.is_anonymous ? 'Anonymous Mode' : c.complainant_name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest italic">
                              {c.is_anonymous ? 'Privacy Shield Active' : c.complainant_matric}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8 max-w-xs">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-blue-500 uppercase tracking-wider line-clamp-1 italic">{c.title}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">{c.category.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border-2 transition-all shadow-lg shadow-black/20
                            ${c.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 
                              c.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                              'bg-blue-500/10 text-blue-500 border-blue-500/30'}
                          `}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <select 
                              onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                              value={c.status}
                              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                             >
                               <option value="pending">Pending</option>
                               <option value="reviewing">In Review</option>
                               <option value="resolved">Resolved</option>
                             </select>
                             <button 
                               onClick={() => { setSelected(c); setIsModalOpen(true); }}
                               className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow-xl"
                             >
                               <ExternalLink className="w-5 h-5" />
                             </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {loading && (
                <div className="py-24 flex flex-col items-center justify-center gap-6">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-xl shadow-blue-900/20" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic animate-pulse">Syncing Encrypted Logs...</p>
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-700 shadow-2xl">
                     <Search className="w-10 h-10 text-slate-600" />
                  </div>
                  <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">No Matches Found</h4>
                  <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto font-medium leading-relaxed">The surveillance filter didn't find any reports matching your current query.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Response Modal */}
      <AnimatePresence>
        {isModalOpen && selected && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1E293B] rounded-[3rem] shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Reviewing Report</span>
                    <h2 className="text-2xl font-black text-white mt-1 italic uppercase tracking-tighter">#{selected.reference_id?.slice(-8)}</h2>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject</p>
                    <p className="text-white font-bold">{selected.title}</p>
                    <p className="text-xs text-slate-400 mt-4 leading-relaxed">{selected.description}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Official Response</label>
                    <textarea 
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Enter your investigation findings or response here..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 min-h-[150px] resize-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleStatusUpdate(selected.id || selected._id, 'reviewing')}
                      className="py-4 rounded-2xl bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                    >
                      Mark In-Review
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selected.id || selected._id, 'resolved')}
                      className="py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/20"
                    >
                      Resolve Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

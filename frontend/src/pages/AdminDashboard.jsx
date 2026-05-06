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
  <div className="bg-[#111827] p-6 rounded-2xl shadow-xl border border-slate-800/60 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col items-end">
        <p className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-500 mb-1">{label}</p>
        <h4 className="text-2xl font-black text-white tracking-tighter italic">{value}</h4>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-blue-500/50" />
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{description}</p>
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
      const data = await complaintService.getAll();
      const complaintsArray = Array.isArray(data) ? data : [];
      setComplaints(complaintsArray);
      
      setStats({
        total: complaintsArray.length,
        pending: complaintsArray.filter(c => c.status === 'pending').length,
        resolved: complaintsArray.filter(c => c.status === 'resolved').length,
        suspicious: 0 
      });
    } catch (err) {
      toast.error('Data link failed.');
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
        comment: adminComment || `System update: ${new Date().toISOString()}`
      });
      toast.success(`Protocol Updated`);
      setIsModalOpen(false);
      setAdminComment('');
      fetchData();
    } catch (err) {
      toast.error('Update refused.');
    }
  };

  const filtered = (complaints || []).filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesQuery = 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      c.reference_id.toLowerCase().includes(query.toLowerCase()) ||
      c.complainant_name?.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex min-h-screen bg-[#0B1120] font-sans">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black tracking-[0.3em] text-blue-500 uppercase italic">Command Interface</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Control Center</h1>
            </motion.div>
            
            <div className="flex gap-3">
               <button 
                onClick={fetchData}
                className="px-5 py-3 rounded-xl bg-slate-800/40 text-[9px] font-black text-slate-300 hover:text-white hover:bg-slate-700 transition-all uppercase tracking-widest border border-slate-700/50"
               >
                 Refresh Link
               </button>
               <button className="px-5 py-3 rounded-xl bg-blue-600 text-white text-[9px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20">
                 Export Logs
               </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={ClipboardList} label="Volume" value={stats.total} color="bg-blue-600" description="Total Audit Logs" />
            <StatCard icon={Clock}         label="Open"   value={stats.pending} color="bg-amber-600" description="Awaiting Action" />
            <StatCard icon={CheckCircle}   label="Fixed"  value={stats.resolved} color="bg-green-600" description="Resolved Entries" />
            <StatCard icon={ShieldAlert}   label="Threats" value={stats.suspicious} color="bg-red-600" description="Anomalies Found" />
          </div>

          {/* List Table */}
          <div className="bg-[#111827] rounded-2xl shadow-2xl border border-slate-800/60 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-800 flex flex-col lg:flex-row gap-6 lg:items-center justify-between bg-slate-900/20">
              <h3 className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase italic">System Audit Log</h3>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[280px] flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-5 py-2.5 focus-within:border-blue-500/40 transition-all">
                  <Search className="w-3.5 h-3.5 text-slate-600" />
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search Reference, Subject or ID..." 
                    className="text-[10px] font-bold bg-transparent text-white focus:outline-none w-full placeholder:text-slate-700 uppercase" 
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-5 py-2.5">
                  <Filter className="w-3.5 h-3.5 text-slate-600" />
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)} 
                    className="text-[9px] font-black uppercase tracking-widest bg-transparent text-slate-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Filter: All</option>
                    <option value="pending">Filter: Pending</option>
                    <option value="reviewing">Filter: Review</option>
                    <option value="resolved">Filter: Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-950 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-slate-800">
                    <th className="px-8 py-5 text-left">Ref_Code</th>
                    <th className="px-8 py-5 text-left">Entity_Profile</th>
                    <th className="px-8 py-5 text-left">Subject_Matter</th>
                    <th className="px-8 py-5 text-left">Current_State</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <AnimatePresence>
                    {filtered.map((c) => (
                      <motion.tr 
                        key={c.id} 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="group hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <span className="font-mono text-[9px] font-black text-slate-600 group-hover:text-blue-500 transition-colors">
                            #{c.reference_id?.slice(-8)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white tracking-tight uppercase">
                              {c.is_anonymous ? 'Anonymous Mode' : c.complainant_name}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest italic">
                              {c.is_anonymous ? 'Shield Active' : c.complainant_matric}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-xs">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-wider line-clamp-1 italic">{c.title}</span>
                            <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-widest">{c.category.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] rounded-lg border transition-all
                            ${c.status === 'pending' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 
                              c.status === 'resolved' ? 'bg-green-500/5 text-green-500 border-green-500/20' : 
                              'bg-blue-500/5 text-blue-500 border-blue-500/20'}
                          `}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <select 
                               onChange={(e) => handleStatusUpdate(c.id || c._id, e.target.value)}
                               value={c.status}
                               className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 focus:outline-none transition-all"
                             >
                               <option value="pending">Pending</option>
                               <option value="reviewing">In Review</option>
                               <option value="resolved">Resolved</option>
                             </select>
                             <button 
                               onClick={() => { setSelected(c); setIsModalOpen(true); }}
                               className="p-2 rounded-lg bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {loading && (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic animate-pulse">Establishing Connection...</p>
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-xl">
                     <Search className="w-6 h-6 text-slate-700" />
                  </div>
                  <h4 className="text-xl font-black text-white tracking-tight uppercase italic">No Entry Found</h4>
                  <p className="text-slate-600 text-[10px] mt-2 max-w-sm mx-auto font-black uppercase tracking-widest italic">The system filter returned zero results for the current query.</p>
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0B1120] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
                  <div>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Investigation Protocol</span>
                    <h2 className="text-xl font-black text-white mt-1 italic uppercase tracking-tighter">#{selected.reference_id?.slice(-8)}</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-900 text-slate-500 flex items-center justify-center hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/60">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Entity Log Content</p>
                    <p className="text-blue-500 text-[10px] font-black uppercase mb-3 italic tracking-tight">{selected.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{selected.description}</p>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1 italic">Official Findings & Commentary</label>
                    <textarea 
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Input investigation results for permanent log..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-5 text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 min-h-[140px] resize-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleStatusUpdate(selected.id || selected._id, 'reviewing')}
                      className="py-4 rounded-xl bg-slate-900 text-slate-300 text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all border border-slate-800"
                    >
                      Set: Under_Review
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selected.id || selected._id, 'resolved')}
                      className="py-4 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                    >
                      Set: Resolved_Fix
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

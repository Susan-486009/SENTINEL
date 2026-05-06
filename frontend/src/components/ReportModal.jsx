import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ShieldCheck, User, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const ReportModal = ({ isOpen, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Your report has been received. We'll handle it from here.");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="bg-blue-600 px-10 py-10 text-white flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Submit Report</h3>
                <p className="text-blue-100 text-xs font-bold mt-3 uppercase tracking-widest">Lagos State University of Science and Technology</p>
              </div>
              <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10 group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 lg:p-12 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      type="text" 
                      placeholder="JOHN DOE" 
                      className="input-premium pl-14 py-3.5 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Matric/Staff ID</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      type="text" 
                      placeholder="2024/XXX/XXXX" 
                      className="input-premium pl-14 py-3.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Category</label>
                <div className="relative group">
                  <select className="input-premium py-3.5 text-xs appearance-none">
                    <option>ACADEMIC ISSUES</option>
                    <option>FACILITY MAINTENANCE</option>
                    <option>SECURITY CONCERN</option>
                    <option>STAFF RELATIONS</option>
                    <option>OTHER</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Description</label>
                <div className="relative group">
                   <MessageSquare className="absolute left-6 top-6 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                   <textarea 
                    required
                    rows="4" 
                    placeholder="TELL US EXACTLY WHAT HAPPENED..."
                    className="input-premium pl-14 py-5 text-xs min-h-[140px] resize-none rounded-[2rem]"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-4 mt-4"
              >
                Submit Now
                <Send className="w-4 h-4" />
              </motion.button>
              
              <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                Official LASUSTECH Support Node
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Upload, X, FileText, Image as ImageIcon,
  AlertCircle, ChevronDown, User, EyeOff, CheckCircle2, ShieldCheck, 
  ArrowRight, ArrowLeft, Lock, Shield, 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService, aiService } from '../services/api';

/* ─────────────────── constants ─────────────────────────── */
const CATEGORIES = [
  { value: '', label: 'Select a category…' },
  { value: 'academic-result',   label: '🎓 Academic — Result / Grade Issue' },
  { value: 'academic-lecturer', label: '📚 Academic — Lecturer Conduct' },
  { value: 'facility-maint',   label: '🔧 Facility — Maintenance' },
  { value: 'facility-hostel',  label: '🏠 Facility — Hostel / Accommodation' },
  { value: 'admin-staff',      label: '🏛  Administrative — Staff Relations' },
  { value: 'security',         label: '🔒 Security Concern' },
  { value: 'financial',        label: '💳 Financial / Bursary' },
  { value: 'it-service',       label: '💻 IT / Portal Services' },
  { value: 'other',            label: '📋 Other' },
];

const AI_SUGGESTIONS = {
  'academic-result':   'Tip: Include your course code, semester, and expected grade. Attach a scan of your result sheet if available.',
  'academic-lecturer': 'Tip: Provide specific dates of incidents and any witnesses present. Stick to factual descriptions.',
  'facility-maint':    'Tip: State the exact location (block, floor, room number) and how long the issue has persisted.',
  'facility-hostel':   'Tip: Mention your room number, block, and when the problem started. Photos are highly recommended.',
  'admin-staff':       'Tip: Describe the interaction clearly — include names, dates, and the outcome you are seeking.',
  'security':          'Tip: Report urgent security threats directly to the Dean of Students office first. Use this portal for a formal record.',
  'financial':         'Tip: Include your payment receipt reference and the exact amount in dispute.',
  'it-service':        'Tip: State the portal URL or service name and include any error messages you received.',
  'other':             'Tip: Be as specific as possible so the right department can be assigned.',
};

/* ─────────────────── helpers ────────────────────────────── */
const fileIcon = (type) =>
  type.startsWith('image/') ? (
    <ImageIcon className="w-4 h-4 text-blue-500" />
  ) : (
    <FileText className="w-4 h-4 text-slate-500" />
  );

const formatBytes = (b) =>
  b < 1024 ? `${b} B` : b < 1024 ** 2 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 ** 2).toFixed(1)} MB`;

const validate = ({ category, title, description }) => {
  const e = {};
  if (!category)            e.category    = 'Please select a category.';
  if (!title.trim())        e.title       = 'Complaint title is required.';
  else if (title.trim().length < 10) e.title = 'Title must be at least 10 characters.';
  if (!description.trim())  e.description = 'Please describe your complaint.';
  else if (description.trim().length < 30) e.description = 'Description must be at least 30 characters.';
  return e;
};

const TrustBanner = () => (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 flex items-center gap-6 shadow-2xl shadow-blue-900/20">
    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20">
      <ShieldCheck className="w-6 h-6 text-white" />
    </div>
    <div>
      <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] italic">Institutional Integrity Shield</h4>
      <p className="text-blue-100 text-[10px] font-bold leading-relaxed mt-1 uppercase tracking-tight opacity-80">
        Active AES-256 encryption. Your report is securely routed to authorized LASUSTECH monitoring nodes.
      </p>
    </div>
  </div>
);

const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    category: '', title: '', description: '',
  });
  const [anonymous, setAnonymous]   = useState(false);
  const [files, setFiles]           = useState([]);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [charCount, setCharCount]   = useState(0);
  const [analyzing, setAnalyzing]   = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [step, setStep]             = useState(1);
  const [submittedRef, setSubmittedRef] = useState(null);
  const totalSteps = 3;
  const fileInputRef = useRef(null);
  const debounceRef  = useRef(null);

  const set = (key) => (e) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    if (key === 'description') setCharCount(e.target.value.length);
  };

  /* ── file handling ─── */
  const addFiles = useCallback((incoming) => {
    const valid = [...incoming].filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5 MB limit.`);
        return false;
      }
      return true;
    });
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))].slice(0, 5);
    });
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => setFiles((p) => p.filter((_, i) => i !== idx));

  /* ── submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', fields.category);
      formData.append('title', fields.title);
      formData.append('description', fields.description);
      formData.append('isAnonymous', anonymous);
      files.forEach((file) => formData.append('files', file));

      const { data } = await complaintService.submit(formData);
      setSubmittedRef(data.reference_id);
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  /* ── AI Analysis ─── */
  useEffect(() => {
    if (fields.description.length < 30) {
      setAiAnalysis(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAnalyzing(true);
      try {
        const data = await aiService.analyze(fields.description);
        setAiAnalysis(data);
      } catch (err) {
        console.error('AI Analysis failed:', err);
      } finally {
        setAnalyzing(false);
      }
    }, 2000);
    return () => clearTimeout(debounceRef.current);
  }, [fields.description]);

  if (submittedRef) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111827] p-12 max-w-md w-full text-center relative border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          
          <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
            <CheckCircle2 className="w-10 h-10 text-blue-500" />
          </div>

          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Protocol Logged</h2>
          <p className="text-slate-500 text-[10px] mb-10 leading-relaxed font-black uppercase tracking-widest italic">
            Your report has been encrypted and assigned to the institutional audit queue. 
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-10">
            <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mb-2">Unique_Tracking_Reference</p>
            <p className="text-2xl font-black text-white tracking-widest tabular-nums">{submittedRef}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/track', { state: { refId: submittedRef } })}
              className="w-full btn-primary py-5"
            >
              Monitor Status
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-blue-500 transition-colors"
            >
              Back to Terminal
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[9px] font-black tracking-[0.3em] text-blue-500 uppercase italic">Initiating Reporting Protocol</span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">New Report</h1>
          <p className="text-slate-600 mt-3 text-[11px] font-bold uppercase tracking-widest italic">
            Document the incident with precision for efficient investigation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TrustBanner />

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-12 px-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 border
                    ${step >= s ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{s}</span>}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] italic
                    ${step === s ? 'text-blue-500' : 'text-slate-700'}`}>
                    {s === 1 ? 'Data' : s === 2 ? 'Media' : 'Secure'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-[1px] transition-all duration-700 ${step > s ? 'bg-blue-600' : 'bg-slate-800'}`} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-10 space-y-10">

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div>
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 ml-1 italic">
                          Incident_Classification
                        </label>
                        <div className="relative group">
                          <select
                            value={fields.category}
                            onChange={set('category')}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white appearance-none focus:outline-none focus:border-blue-500/40 transition-all uppercase italic"
                          >
                            {CATEGORIES.map(({ value, label }) => (
                              <option key={value} value={value} className="bg-[#0B1120]">
                                {label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>

                      {/* AI Suggestion Box */}
                      <AnimatePresence>
                        {(aiAnalysis || analyzing) && (
                          <motion.div
                            key="ai-box"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                          >
                            <div className={`flex items-start gap-5 bg-slate-950 border-2 rounded-2xl px-6 py-6 transition-all duration-500
                              ${analyzing ? 'border-blue-500/10 animate-pulse' : 'border-blue-500/20 shadow-lg shadow-blue-900/5'}`}
                            >
                              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                {analyzing 
                                  ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                  : <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                                }
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] italic">Sentinel_AI_Sync</p>
                                  {aiAnalysis?.priority && (
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400`}>
                                      {aiAnalysis.priority} PRIORITY
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic uppercase tracking-tight">
                                  {analyzing ? 'Processing incoming data feed...' : aiAnalysis?.recommendation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 ml-1 italic">
                          Protocol_Subject
                        </label>
                        <input
                          type="text"
                          value={fields.title}
                          onChange={set('title')}
                          placeholder="SHORT REFERENCE TITLE"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all uppercase italic"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3 ml-1">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Incident_Full_Logs</label>
                          <span className={`text-[9px] font-black tabular-nums italic ${charCount >= 500 ? 'text-amber-500' : 'text-slate-700'}`}>
                            {charCount} / 500
                          </span>
                        </div>
                        <textarea
                          rows={6}
                          maxLength={500}
                          value={fields.description}
                          onChange={set('description')}
                          placeholder="DETAILED DESCRIPTION OF INCIDENT — PERSONNEL, LOCATION, TIMESTAMPS..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-xs font-black tracking-widest text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500/40 transition-all uppercase min-h-[180px] resize-none italic"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="mb-6">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Evidence Nodes</h3>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Upload media packets for verification.</p>
                      </div>

                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl p-16 cursor-pointer transition-all duration-300
                          ${dragging
                            ? 'border-blue-600 bg-blue-600/5 shadow-2xl shadow-blue-900/10'
                            : 'border-slate-800 hover:border-blue-500/30 hover:bg-slate-900/50'
                          }`}
                      >
                        <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-1">
                          <Upload className="w-8 h-8 text-slate-700" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">
                            {dragging ? 'Release to Upload' : 'Synchronize Files'}
                          </p>
                          <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.3em] mt-2 italic">JPEG_PNG_PDF (MAX 5MB)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => addFiles(e.target.files)}
                        />
                      </div>

                      <AnimatePresence>
                        {files.length > 0 && (
                          <div className="grid grid-cols-1 gap-4">
                            {files.map((f, i) => (
                              <motion.div
                                key={f.name + i}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 group"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                                    {fileIcon(f.type)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white truncate font-black text-[10px] uppercase tracking-tight italic">{f.name}</p>
                                    <p className="text-slate-700 text-[8px] font-black uppercase tracking-widest italic">{formatBytes(f.size)}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(i)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-8"
                    >
                      <div className="mb-6">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Security Protocol</h3>
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Define identity visibility for this session.</p>
                      </div>

                      <div className={`border rounded-2xl p-8 transition-all duration-500 ${anonymous ? 'bg-slate-900 border-blue-500/20 shadow-2xl shadow-blue-900/10' : 'bg-slate-950 border-slate-800'}`}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 ${anonymous ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
                              {anonymous ? <EyeOff className="w-7 h-7" /> : <User className="w-7 h-7" />}
                            </div>
                            <div>
                              <div className="flex items-center justify-center sm:justify-start gap-3">
                                <h4 className={`text-lg font-black uppercase tracking-tight italic ${anonymous ? 'text-white' : 'text-slate-300'}`}>
                                  {anonymous ? 'Anonymous_Link' : 'Verified_Identity'}
                                </h4>
                              </div>
                              <p className={`text-[10px] mt-2 leading-relaxed font-bold uppercase tracking-tight italic ${anonymous ? 'text-slate-500' : 'text-slate-600'}`}>
                                {anonymous
                                  ? 'Identity metadata will be stripped from the audit trail. Best for sensitive disclosures.'
                                  : `Report will be logged under ${user?.name?.toUpperCase()}. Priority routing enabled.`
                                }
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAnonymous((a) => !a)}
                            className={`relative shrink-0 w-14 h-7 rounded-full transition-all duration-500 ${anonymous ? 'bg-blue-600' : 'bg-slate-800'}`}
                          >
                            <motion.span
                              animate={{ x: anonymous ? 30 : 4 }}
                              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
                        <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[8px] text-slate-700 font-black leading-relaxed uppercase tracking-[0.2em] italic">
                          PROTOCOL_SUBMISSION_NOTICE: FALSIFYING DATA WITHIN THE SENTINEL NETWORK IS A DIRECT VIOLATION OF LASUSTECH CODE 401-B.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(s => s - 1)}
                      className="flex-1 py-4 px-6 rounded-xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-blue-500 hover:border-blue-500/20 transition-all flex items-center justify-center gap-2 italic"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Prev_Protocol
                    </button>
                  )}
                  
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={() => setStep(s => s + 1)}
                      className="flex-[2] py-4 px-6 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic"
                    >
                      Next_Stage <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-4 px-6 rounded-xl bg-white text-[#0B1120] text-[9px] font-black uppercase tracking-[0.3em] shadow-lg shadow-white/10 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 italic"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Finalize_Protocol
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Sentinel Integrity Shield v2.0
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitComplaint;

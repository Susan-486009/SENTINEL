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

/* ─────────────────── helpers ────────────────────────────── */
const fileIcon = (type) =>
  type.startsWith('image/') ? (
    <ImageIcon className="w-4 h-4 text-blue-600" />
  ) : (
    <FileText className="w-4 h-4 text-slate-400" />
  );

const formatBytes = (b) =>
  b < 1024 ? `${b} B` : b < 1024 ** 2 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 ** 2).toFixed(1)} MB`;

const TrustBanner = () => (
  <div className="bg-blue-600 rounded-3xl p-6 mb-10 flex items-center gap-6 shadow-xl shadow-blue-100">
    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20">
      <ShieldCheck className="w-6 h-6 text-white" />
    </div>
    <div>
      <h4 className="text-white text-[11px] font-black uppercase tracking-widest">Institutional Integrity Shield</h4>
      <p className="text-blue-50 text-[11px] font-medium leading-relaxed mt-1 opacity-90">
        Your report is protected by end-to-end encryption and routed directly to authorized monitoring nodes.
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 max-w-md w-full text-center relative border border-slate-100 rounded-[3rem] shadow-2xl shadow-blue-900/10"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100">
            <CheckCircle2 className="w-12 h-12 text-blue-600" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Report Logged</h2>
          <p className="text-slate-500 text-xs font-medium mb-10 leading-relaxed">
            Your case has been officially synchronized with the institutional audit queue. 
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 mb-10 shadow-inner">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Case Reference ID</p>
            <p className="text-3xl font-black text-blue-600 tracking-widest tabular-nums">{submittedRef}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/track', { state: { refId: submittedRef } })}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:bg-blue-700"
            >
              Monitor Status
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
             <span className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase">Case Initiation Protocol</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">New Report</h1>
          <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Document your concern with precision for immediate institutional attention.
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
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2
                    ${step >= s ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white border-slate-100 text-slate-300'}`}>
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm">{s}</span>}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest
                    ${step === s ? 'text-blue-600' : 'text-slate-300'}`}>
                    {s === 1 ? 'Details' : s === 2 ? 'Evidence' : 'Oversight'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 transition-all duration-700 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden mb-12">
              <div className="p-10 lg:p-12 space-y-12">

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-10"
                    >
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Classification Node
                        </label>
                        <div className="relative group">
                          <select
                            value={fields.category}
                            onChange={set('category')}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest text-slate-900 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-all uppercase"
                          >
                            {CATEGORIES.map(({ value, label }) => (
                              <option key={value} value={value} className="text-slate-900">
                                {label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
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
                            <div className={`flex items-start gap-6 bg-blue-50/50 border-2 rounded-[2rem] p-8 transition-all duration-500
                              ${analyzing ? 'border-blue-500/10 animate-pulse' : 'border-blue-500/10'}`}
                            >
                              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                                {analyzing 
                                  ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                  : <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                                }
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Sentinel_AI_Guidance</p>
                                  {aiAnalysis?.priority && (
                                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-100">
                                      {aiAnalysis.priority} PRIORITY
                                    </span>
                                  )}
                                </div>
                                <p className="text-[12px] text-slate-600 leading-relaxed font-bold italic uppercase tracking-tight">
                                  {analyzing ? 'Synchronizing with institutional data feed...' : aiAnalysis?.recommendation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Report Title
                        </label>
                        <input
                          type="text"
                          value={fields.title}
                          onChange={set('title')}
                          placeholder="SHORT, DESCRIPTIVE TITLE"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all uppercase"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Disclosure</label>
                          <span className={`text-[9px] font-black tabular-nums ${charCount >= 500 ? 'text-amber-500' : 'text-slate-300'}`}>
                            {charCount} / 500
                          </span>
                        </div>
                        <textarea
                          rows={6}
                          maxLength={500}
                          value={fields.description}
                          onChange={set('description')}
                          placeholder="DESCRIBE THE INCIDENT IN DETAIL — INCLUDING NAMES, LOCATIONS, AND TIMESTAMPS..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold tracking-widest text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all uppercase min-h-[200px] resize-none"
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
                      className="space-y-10"
                    >
                      <div className="mb-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Evidence Packets</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Upload media to support your case.</p>
                      </div>

                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-6 border-2 border-dashed rounded-[2.5rem] p-20 cursor-pointer transition-all duration-300
                          ${dragging
                            ? 'border-blue-600 bg-blue-50 shadow-2xl shadow-blue-100'
                            : 'border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-white'
                          }`}
                      >
                        <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">
                            {dragging ? 'Release Payload' : 'Select Official Files'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">JPEG • PNG • PDF (MAX 5MB)</p>
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
                                className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 group"
                              >
                                <div className="flex items-center gap-5 min-w-0">
                                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    {fileIcon(f.type)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-slate-900 truncate font-black text-xs uppercase tracking-tight">{f.name}</p>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{formatBytes(f.size)}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(i)}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                  <X className="w-5 h-5" />
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
                      className="space-y-10"
                    >
                      <div className="mb-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Oversight Preferences</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Configure privacy and accountability.</p>
                      </div>

                      <div className={`border-2 rounded-[2.5rem] p-10 transition-all duration-500 ${anonymous ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-10">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${anonymous ? 'bg-white border-white text-blue-600 shadow-xl' : 'bg-white border-slate-100 text-slate-300'}`}>
                              {anonymous ? <EyeOff className="w-8 h-8" /> : <User className="w-8 h-8" />}
                            </div>
                            <div>
                              <h4 className={`text-xl font-black uppercase tracking-tight ${anonymous ? 'text-white' : 'text-slate-900'}`}>
                                {anonymous ? 'Anonymous Mode' : 'Verified Profile'}
                              </h4>
                              <p className={`text-[12px] mt-3 leading-relaxed font-bold uppercase tracking-tight ${anonymous ? 'text-blue-100' : 'text-slate-500'}`}>
                                {anonymous
                                  ? 'Identity metadata will be scrubbed from the final report. Recommended for sensitive disclosures.'
                                  : `Report will be officially logged under ${user?.name?.toUpperCase()}. Recommended for standard issues.`
                                }
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAnonymous((a) => !a)}
                            className={`relative shrink-0 w-16 h-8 rounded-full transition-all duration-500 border-2 ${anonymous ? 'bg-white/20 border-white/40' : 'bg-slate-200 border-slate-300'}`}
                          >
                            <motion.span
                              animate={{ x: anonymous ? 34 : 4 }}
                              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex items-start gap-6">
                        <Lock className="w-6 h-6 text-blue-600 shrink-0" />
                        <p className="text-[10px] text-slate-500 font-black leading-relaxed uppercase tracking-widest">
                          SENTINEL_OVERSIGHT_CLAUSE: ALL REPORTS ARE SUBJECT TO THE UNIVERSITY CODE OF CONDUCT. MISLEADING REPORTS MAY RESULT IN DISCIPLINARY ACTIONS.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-6 pt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(s => s - 1)}
                      className="flex-1 py-5 px-8 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-3"
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                  )}
                  
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={() => setStep(s => s + 1)}
                      className="flex-[2] py-5 px-8 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-5 px-8 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-4"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Finalize Report
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Sentinel Security Protocol v2.4
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

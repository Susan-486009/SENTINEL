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

const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-bold uppercase tracking-wider">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  ) : null;

const TrustBanner = () => (
  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-5 mb-10 flex items-center gap-5 shadow-lg shadow-green-900/10">
    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
      <ShieldCheck className="w-6 h-6 text-white" />
    </div>
    <div>
      <h4 className="text-white text-xs font-black uppercase tracking-widest italic">Institutional Trust Shield</h4>
      <p className="text-white/80 text-[10px] font-medium leading-relaxed mt-1">
        Your data is encrypted and handled according to the Student Privacy Act. Reports are strictly accessed by authorized officers.
      </p>
    </div>
  </div>
);

/* ─────────────────── component ──────────────────────────── */
const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    category: '', title: '', description: '',
  });
  const [anonymous, setAnonymous]   = useState(false);
  const [files, setFiles]           = useState([]);
  const [dragging, setDragging]     = useState(false);
  const [touched, setTouched]       = useState({});
  const [loading, setLoading]       = useState(false);
  const [charCount, setCharCount]   = useState(0);
  const [analyzing, setAnalyzing]   = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [step, setStep]             = useState(1);
  const [submittedRef, setSubmittedRef] = useState(null);
  const totalSteps = 3;
  const fileInputRef = useRef(null);
  const debounceRef  = useRef(null);

  const errors  = validate(fields);
  const hasErr  = Object.keys(errors).length > 0;
  const aiTip   = AI_SUGGESTIONS[fields.category] || null;

  const set = (key) => (e) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    if (key === 'description') setCharCount(e.target.value.length);
  };
  const blur = (key) => () => setTouched((p) => ({ ...p, [key]: true }));

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
    setTouched({ category: true, title: true, description: true });
    if (hasErr) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', fields.category);
      formData.append('title', fields.title);
      formData.append('description', fields.description);
      formData.append('isAnonymous', anonymous);

      files.forEach((file) => {
        formData.append('files', file);
      });

      const { data } = await complaintService.submit(formData);
      setSubmittedRef(data.reference_id);
      toast.success('Report secured successfully.');
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
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
        // Auto-select category if AI is confident and user hasn't touched it much? 
        // For now, just show the recommendation.
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-premium p-12 max-w-md w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
          
          <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 rotate-3 shadow-xl shadow-green-900/10">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter italic">Report Secured</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
            Your report has been encrypted and safely delivered to the institutional monitoring office. 
            <span className="block mt-2 text-primary font-black">Please save your Tracking ID below:</span>
          </p>

          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 mb-10 group relative">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Unique Tracking ID</p>
            <p className="text-2xl font-black text-slate-900 tracking-widest tabular-nums">{submittedRef}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(submittedRef);
                toast.info('ID copied to clipboard!');
              }}
              className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
            >
              Copy to Clipboard
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/track', { state: { refId: submittedRef } })}
              className="w-full btn-primary py-5 shadow-blue-900/20"
            >
              View Report Status
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="inline-block text-[10px] font-black tracking-[0.2em] text-primary uppercase bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            Create New Report
          </span>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">Submit a Report</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            We'll look into your report and get back to you as soon as possible.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <TrustBanner />

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-8 px-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500
                    ${step >= s ? 'bg-primary text-white shadow-lg shadow-blue-900/20' : 'bg-slate-100 text-slate-400'}`}>
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest 
                    ${step === s ? 'text-primary' : 'text-slate-400'}`}>
                    {s === 1 ? 'Details' : s === 2 ? 'Evidence' : 'Finalize'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-1 rounded-full transition-all duration-700 ${step > s ? 'bg-primary' : 'bg-slate-100'}`} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="card-premium overflow-hidden">
              <div className="p-8 space-y-10">

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {/* ── 1. Category ───────────────────────────────── */}
                      <div>
                        <label htmlFor="cat" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          What is this about? <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="cat"
                            value={fields.category}
                            onChange={set('category')}
                            onBlur={blur('category')}
                            className={`input-premium appearance-none
                              ${touched.category && errors.category
                                ? 'border-red-400 bg-red-50'
                                : ''
                              } ${!fields.category ? 'text-slate-400 font-medium' : 'text-slate-900 font-bold'}`}
                          >
                            {CATEGORIES.map(({ value, label }) => (
                              <option key={value} value={value} disabled={!value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <FieldError msg={touched.category && errors.category} />
                      </div>

                      {/* ── AI Suggestion Box ──────────────────────────── */}
                      <AnimatePresence>
                        {(aiAnalysis || analyzing) && (
                          <motion.div
                            key="ai-box"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="overflow-hidden"
                          >
                            <div className={`flex items-start gap-5 bg-gradient-to-br border-2 rounded-3xl px-6 py-6 transition-all duration-500
                              ${analyzing 
                                ? 'from-slate-50 to-slate-50 border-slate-100 animate-pulse' 
                                : 'from-violet-50/80 to-blue-50/80 border-violet-100 shadow-lg shadow-violet-900/5'
                              }`}
                            >
                              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-violet-100 flex items-center justify-center shrink-0 shadow-sm">
                                {analyzing 
                                  ? <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                  : <Sparkles className="w-6 h-6 text-violet-600 animate-pulse" />
                                }
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[10px] font-black text-violet-700 uppercase tracking-[0.2em]">
                                    Sentinel AI Helper
                                  </p>
                                  {aiAnalysis?.priority && (
                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border-2
                                      ${aiAnalysis.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 
                                        aiAnalysis.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        'bg-green-50 text-green-600 border-green-100'}
                                    `}>
                                      {aiAnalysis.priority} Priority
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                                  {analyzing ? 'Reading your message to help you out...' : aiAnalysis?.recommendation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── 2. Title ───────────────────────────────────── */}
                      <div>
                        <label htmlFor="title" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          Short Summary <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={fields.title}
                          onChange={set('title')}
                          onBlur={blur('title')}
                          placeholder="Give your report a short title..."
                          className={`input-premium
                            ${touched.title && errors.title ? 'border-red-400 bg-red-50' : ''}`}
                        />
                        <FieldError msg={touched.title && errors.title} />
                      </div>

                      {/* ── 3. Description ─────────────────────────────── */}
                      <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                          <label htmlFor="desc" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Full Details <span className="text-red-500">*</span>
                          </label>
                          <span className={`text-[10px] font-black tabular-nums ${charCount >= 500 ? 'text-orange-500' : 'text-slate-400'}`}>
                            {charCount} / 500
                          </span>
                        </div>
                        <textarea
                          id="desc"
                          rows={6}
                          maxLength={500}
                          value={fields.description}
                          onChange={set('description')}
                          onBlur={blur('description')}
                          placeholder="Tell us everything — what happened, when, where, and who was involved..."
                          className={`input-premium min-h-[160px] resize-none
                            ${touched.description && errors.description ? 'border-red-400 bg-red-50' : ''}`}
                        />
                        <FieldError msg={touched.description && errors.description} />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div>
                        <div className="mb-6">
                          <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Support Evidence</h3>
                          <p className="text-slate-500 text-xs font-medium">Upload photos, receipts, or documents to strengthen your report.</p>
                        </div>

                        {/* Drop zone */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={onDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-3xl p-12 cursor-pointer transition-all duration-300
                            ${dragging
                              ? 'border-primary bg-primary/5 scale-[1.01] shadow-inner'
                              : 'border-slate-100 hover:border-primary/50 hover:bg-slate-50 shadow-sm'
                            }`}
                        >
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-1 transition-transform group-hover:scale-110">
                            <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                              {dragging ? 'Drop them here' : 'Select Files'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Images or PDF (Max 5MB)</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                            className="sr-only"
                            onChange={(e) => addFiles(e.target.files)}
                          />
                        </div>

                        {/* File list */}
                        <AnimatePresence>
                          {files.length > 0 && (
                            <motion.ul
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-6 space-y-3"
                            >
                              {files.map((f, i) => (
                                <motion.li
                                  key={f.name + i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="flex items-center justify-between gap-3 bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm shadow-sm"
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                      {fileIcon(f.type)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-slate-800 truncate font-black text-[10px] uppercase tracking-tight">{f.name}</p>
                                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{formatBytes(f.size)}</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </motion.li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Final Privacy Review</h3>
                        <p className="text-slate-500 text-xs font-medium">Decide how your identity should be handled for this report.</p>
                      </div>

                      {/* ── Anonymous Toggle ────────────────────────── */}
                      <div className={`border-2 rounded-[2.5rem] p-8 transition-all duration-500 ${anonymous ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20' : 'bg-white border-slate-100 shadow-xl shadow-blue-900/5'}`}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500 ${anonymous ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                              {anonymous ? <EyeOff className="w-8 h-8" /> : <User className="w-8 h-8" />}
                            </div>
                            <div>
                              <div className="flex items-center justify-center sm:justify-start gap-3">
                                <h4 className={`text-lg font-black uppercase tracking-tight italic ${anonymous ? 'text-white' : 'text-slate-800'}`}>
                                  {anonymous ? 'Anonymous Report' : 'Standard Identity'}
                                </h4>
                                {anonymous && (
                                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg backdrop-blur-sm border border-green-500/30">
                                    Encrypted
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs mt-3 leading-relaxed font-medium ${anonymous ? 'text-slate-400' : 'text-slate-500'}`}>
                                {anonymous
                                  ? 'Your personal details will be hidden from everyone, including the investigating officers. This is best for sensitive issues.'
                                  : `This report will include your name (${user?.name}). Verified reports often receive faster feedback from institutional staff.`
                                }
                              </p>
                              {anonymous && (
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                  <AlertCircle className="w-4 h-4" />
                                  Verification may be limited.
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAnonymous((a) => !a)}
                            className={`relative shrink-0 w-16 h-8 rounded-full transition-all duration-500 focus:outline-none ring-offset-2 focus:ring-2 ${
                              anonymous ? 'bg-primary focus:ring-white' : 'bg-slate-200 focus:ring-primary'
                            }`}
                          >
                            <motion.span
                              animate={{ x: anonymous ? 36 : 4 }}
                              className="absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-lg"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
                        <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                          By clicking submit, you confirm that all information provided is truthful. False reports are subject to university disciplinary action.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Navigation Buttons ─────────────────────────────── */}
                <div className="flex items-center gap-4 pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(s => s - 1)}
                      className="flex-1 py-4 px-6 rounded-2xl bg-white border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  
                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 1) {
                          setTouched({ category: true, title: true, description: true });
                          if (errors.category || errors.title || errors.description) {
                            toast.error('Please fix the errors in Step 1.');
                            return;
                          }
                        }
                        setStep(s => s + 1);
                      }}
                      className="flex-[2] py-4 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-4 px-6 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Confirm & Submit
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

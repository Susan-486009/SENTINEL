import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Upload, X, FileText, Image as ImageIcon,
  AlertCircle, ChevronDown, User, EyeOff, CheckCircle2, ShieldCheck, 
  ArrowRight, ArrowLeft, Lock, Shield, GraduationCap, Building2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService, aiService } from '../services/api';

/* ─────────────────── constants ─────────────────────────── */
const CATEGORIES = [
  { value: '', label: 'Select a category…' },
  { value: 'academic-result',   label: '🎓 Grades & Results' },
  { value: 'academic-lecturer', label: '📚 Lecturer Conduct' },
  { value: 'facility-maint',   label: '🔧 Repairs & Maintenance' },
  { value: 'facility-hostel',  label: '🏠 Hostel & Housing' },
  { value: 'admin-staff',      label: '🏛 Staff Relations' },
  { value: 'security',         label: '🔒 Campus Security' },
  { value: 'financial',        label: '💳 School Fees & Bursary' },
  { value: 'it-service',       label: '💻 Portal & IT Help' },
  { value: 'other',            label: '📋 Other Concerns' },
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
  <div className="bg-blue-600 rounded-[3rem] p-8 mb-12 flex items-center gap-8 shadow-xl shadow-blue-100 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
       <Shield size={120} />
    </div>
    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20 relative z-10">
      <ShieldCheck className="w-7 h-7 text-white" />
    </div>
    <div className="relative z-10">
      <h4 className="text-white text-xs font-black uppercase tracking-widest">Your Privacy is Protected</h4>
      <p className="text-blue-50 text-[11px] font-medium leading-relaxed mt-1.5 opacity-90">
        All reports are strictly confidential and shared only with authorized university staff members.
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
        console.error('Analysis guide failed:', err);
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
          className="bg-white p-12 lg:p-16 max-w-lg w-full text-center relative border border-slate-100 rounded-[4rem] shadow-2xl shadow-blue-900/10"
        >
          <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-green-100 shadow-sm shadow-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Ticket Received!</h2>
          <p className="text-slate-500 text-sm font-medium mb-12 leading-relaxed">
            Your report has been received. Please keep your ticket number below for tracking.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 mb-12 shadow-inner">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Ticket Number</p>
            <p className="text-4xl font-black text-blue-600 tracking-wider tabular-nums">{submittedRef}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/track', { state: { refId: submittedRef } })}
              className="w-full bg-blue-600 text-white py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 hover:-translate-y-1 active:scale-95"
            >
              Track Case Progress
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
             <span className="text-[11px] font-black tracking-[0.3em] text-blue-600 uppercase">Support Initiation</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">New Ticket</h1>
          <p className="text-slate-500 mt-6 text-sm font-medium leading-relaxed max-w-xl">
            Please provide clear details about your concern so our team can help you faster.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TrustBanner />

          {/* Progress Indicator */}
          <div className="flex items-center gap-6 mb-16 px-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2
                    ${step >= s ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white border-slate-200 text-slate-300'}`}>
                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-lg">{s}</span>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest
                    ${step === s ? 'text-blue-600' : 'text-slate-400'}`}>
                    {s === 1 ? 'Details' : s === 2 ? 'Uploads' : 'Finish'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 transition-all duration-1000 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden mb-16">
              <div className="p-12 lg:p-16 space-y-12">

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-12"
                    >
                      <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-8">
                          Issue Category
                        </label>
                        <div className="relative group">
                          <select
                            value={fields.category}
                            onChange={set('category')}
                            className="input-premium appearance-none pr-16"
                          >
                            {CATEGORIES.map(({ value, label }) => (
                              <option key={value} value={value} className="text-slate-900">
                                {label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
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
                            <div className={`flex items-start gap-8 bg-blue-50/40 border border-blue-500/10 rounded-[2.5rem] p-10 transition-all duration-500
                              ${analyzing ? 'animate-pulse' : ''}`}
                            >
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                                {analyzing 
                                  ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                  : <Sparkles className="w-7 h-7 text-blue-600" />
                                }
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Helpful Guide</p>
                                  {aiAnalysis?.priority && (
                                    <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-100">
                                      {aiAnalysis.priority} Priority
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed font-bold italic uppercase tracking-tight">
                                  {analyzing ? 'Reviewing your details...' : aiAnalysis?.recommendation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-8">
                          Ticket Summary
                        </label>
                        <input
                          type="text"
                          value={fields.title}
                          onChange={set('title')}
                          placeholder="BRIEF TITLE OF THE ISSUE"
                          className="input-premium"
                        />
                      </div>

                      <div className="space-y-5">
                        <div className="flex justify-between items-center px-8">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                          <span className={`text-[10px] font-bold tabular-nums ${charCount >= 500 ? 'text-amber-500' : 'text-slate-300'}`}>
                            {charCount} / 500
                          </span>
                        </div>
                        <textarea
                          rows={8}
                          maxLength={500}
                          value={fields.description}
                          onChange={set('description')}
                          placeholder="TELL US EXACTLY WHAT HAPPENED — INCLUDE DATES, TIMES, AND PEOPLE INVOLVED..."
                          className="input-premium rounded-[2.5rem] min-h-[220px] resize-none"
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
                      className="space-y-12"
                    >
                      <div className="mb-2">
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Add Evidence</h3>
                        <p className="text-slate-500 text-sm font-medium mt-3">Upload any photos or documents that help explain the issue.</p>
                      </div>

                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-8 border-2 border-dashed rounded-[3rem] p-24 cursor-pointer transition-all duration-500
                          ${dragging
                            ? 'border-blue-600 bg-blue-50 shadow-2xl shadow-blue-100'
                            : 'border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-white'
                          }`}
                      >
                        <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <Upload className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                            {dragging ? 'Drop Files Here' : 'Click to Upload Files'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-4">MAX 5MB PER FILE</p>
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
                          <div className="grid grid-cols-1 gap-5">
                            {files.map((f, i) => (
                              <motion.div
                                key={f.name + i}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-between gap-6 bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 group"
                              >
                                <div className="flex items-center gap-6 min-w-0">
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    {fileIcon(f.type)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-slate-900 truncate font-black text-xs uppercase tracking-tight">{f.name}</p>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">{formatBytes(f.size)}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(i)}
                                  className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                  <X className="w-6 h-6" />
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
                      className="space-y-12"
                    >
                      <div className="mb-2">
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Review & Finish</h3>
                        <p className="text-slate-500 text-sm font-medium mt-3">Finalize your report and set your privacy preference.</p>
                      </div>

                      <div className={`border-2 rounded-[3rem] p-12 transition-all duration-500 ${anonymous ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-12">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 text-center sm:text-left">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${anonymous ? 'bg-white border-white text-blue-600 shadow-xl' : 'bg-white border-slate-200 text-slate-300'}`}>
                              {anonymous ? <EyeOff className="w-10 h-10" /> : <User className="w-10 h-10" />}
                            </div>
                            <div>
                              <h4 className={`text-2xl font-black uppercase tracking-tight ${anonymous ? 'text-white' : 'text-slate-900'}`}>
                                {anonymous ? 'Stay Anonymous' : 'Share My Profile'}
                              </h4>
                              <p className={`text-[13px] mt-4 leading-relaxed font-bold uppercase tracking-tight ${anonymous ? 'text-blue-100' : 'text-slate-500'}`}>
                                {anonymous
                                  ? 'Your name and ID will not be shown on the report. Best for sensitive issues.'
                                  : `This report will be sent under your name, ${user?.name?.split(' ')[0]}. Best for standard issues.`
                                }
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAnonymous((a) => !a)}
                            className={`relative shrink-0 w-20 h-10 rounded-full transition-all duration-500 border-2 ${anonymous ? 'bg-white/20 border-white/40' : 'bg-slate-200 border-slate-300'}`}
                          >
                            <motion.span
                              animate={{ x: anonymous ? 44 : 6 }}
                              className="absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-xl"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-10 flex items-start gap-8">
                        <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
                        <p className="text-[11px] text-amber-700 font-black leading-relaxed uppercase tracking-widest">
                          NOTE: BY SUBMITTING THIS REPORT, YOU AGREE THAT ALL INFORMATION PROVIDED IS TRUE. FALSE REPORTS MAY BE SUBJECT TO UNIVERSITY DISCIPLINARY ACTIONS.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-6 pt-10">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(s => s - 1)}
                      className="flex-1 py-5 px-10 rounded-full bg-white border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all flex items-center justify-center gap-4"
                    >
                      <ArrowLeft className="w-5 h-5" /> Previous
                    </button>
                  )}
                  
                  {step < totalSteps ? (
                    <button
                      type="button"
                      disabled={analyzing}
                      onClick={() => setStep(s => s + 1)}
                      className="flex-[2] py-5 px-10 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {analyzing ? 'Reviewing Details...' : 'Next Step'}
                      {!analyzing && <ArrowRight className="w-5 h-5" />}
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-5 px-10 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-5"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit Final Ticket
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                <p className="text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                  Lagos State University of Science and Technology
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

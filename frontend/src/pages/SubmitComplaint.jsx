import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Upload, X, FileText, Image as ImageIcon,
  ChevronDown, CheckCircle2, ShieldCheck, 
  ArrowRight, ArrowLeft, Shield, GraduationCap, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService, aiService } from '../services/api';

/* ─────────────────── constants ─────────────────────────── */
const CATEGORIES = [
  { value: '', label: 'Select category…' },
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

const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load from Draft if exists
  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem('complaint_draft');
    return saved ? JSON.parse(saved) : { category: '', title: '', description: '' };
  });

  const [anonymous, setAnonymous]   = useState(false);
  const [files, setFiles]           = useState([]);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [analyzing, setAnalyzing]   = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [step, setStep]             = useState(1);
  const [submittedRef, setSubmittedRef] = useState(null);
  
  const totalSteps = 3;
  const fileInputRef = useRef(null);
  const debounceRef  = useRef(null);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('complaint_draft', JSON.stringify(fields));
  }, [fields]);

  const set = (key) => (e) => {
    let val = e.target.value;
    // Smart Input Handling: Auto-uppercase titles
    if (key === 'title') val = val.toUpperCase();
    setFields((p) => ({ ...p, [key]: val }));
  };

  /* ── file handling ─── */
  const addFiles = useCallback((incoming) => {
    const valid = [...incoming].filter((f) => f.size <= 5 * 1024 * 1024);
    if (incoming.length > valid.length) toast.warn('Some files exceeded 5MB limit');
    
    setFiles((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, 5); // Max 5 files
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
      formData.append('title', fields.title.trim());
      formData.append('description', fields.description.trim());
      formData.append('isAnonymous', anonymous);
      files.forEach((file) => formData.append('files', file));

      const { data } = await complaintService.submit(formData);
      localStorage.removeItem('complaint_draft'); // Clear draft on success
      setSubmittedRef(data.referenceId || data.reference_id);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
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
        console.error('AI Guide Offline');
      } finally {
        setAnalyzing(false);
      }
    }, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [fields.description]);

  if (submittedRef) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 max-w-md w-full text-center border border-slate-200 rounded-2xl shadow-sm"
        >
          <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-8 border border-green-100">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ticket Received</h2>
          <p className="text-slate-500 text-xs font-medium mb-10 uppercase tracking-wider">Reference Code Recorded</p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10 flex flex-col items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Ticket Number</p>
            <p className="text-3xl font-bold text-blue-600 tracking-wider font-mono">{submittedRef}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/track')}
              className="w-full btn-primary py-3"
            >
              Track Progress
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* Compact header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-blue-600" />
             <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">New Support Ticket</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Institutional Support Initiation</h1>
          <p className="text-slate-500 mt-2 text-xs font-medium leading-relaxed max-w-xl">
            Please provide accurate details of your concern. Our teams will review and coordinate the resolution.
          </p>
        </div>

        {/* Refined Trust Banner */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-10 flex items-center gap-6 shadow-sm relative overflow-hidden">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10 relative z-10">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <h4 className="text-white text-[11px] font-bold uppercase tracking-wider">End-to-End Encryption</h4>
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed mt-1">
              Your data is secured using institutional-grade encryption and shared only with authorized staff.
            </p>
          </div>
        </div>

        {/* High Density Progress Indicator */}
        <div className="flex items-center gap-3 mb-12 px-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-200 border
                  ${step >= s ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-300'}`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block
                  ${step === s ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Evidence' : 'Finalize'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-px transition-all duration-500 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
            <div className="p-8 lg:p-10 space-y-10">

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={fields.category}
                          onChange={set('category')}
                          className="input-professional appearance-none pr-10"
                        >
                          {CATEGORIES.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>

                    {/* Compact AI Insight */}
                    <AnimatePresence>
                      {(aiAnalysis || analyzing) && (
                        <motion.div
                          key="ai-box"
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 2 }}
                          className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                            {analyzing 
                              ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              : <Sparkles className="w-5 h-5 text-blue-600" />
                            }
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[9px] font-bold text-blue-600 uppercase">Support Guide</p>
                                {aiAnalysis?.priority && (
                                  <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
                                    {aiAnalysis.priority} Priority
                                  </span>
                                )}
                             </div>
                             <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                                {analyzing ? 'Analyzing details...' : aiAnalysis?.recommendation}
                             </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Ticket Title
                      </label>
                      <input
                        type="text"
                        value={fields.title}
                        onChange={set('title')}
                        placeholder="BRIEF SUMMARY OF THE ISSUE"
                        className="input-professional"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                        <span className="text-[10px] font-bold text-slate-300">
                          {fields.description.length} / 500
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        maxLength={500}
                        value={fields.description}
                        onChange={set('description')}
                        placeholder="PROVIDE CLEAR AND CONCISE DETAILS..."
                        className="input-professional min-h-[160px] resize-none rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Evidence Collection</h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">Upload supporting documents or photos (Max 5 files).</p>
                    </div>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-6 border border-dashed rounded-xl p-16 cursor-pointer transition-all duration-200
                        ${dragging
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {dragging ? 'Drop Files' : 'Click to Upload'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-2">Max 5MB per file</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(e) => addFiles(e.target.files)}
                      />
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Attached Files ({files.length}/5)</p>
                        </div>
                        {files.map((f, i) => (
                          <div
                            key={f.name + i}
                            className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="p-2 bg-white rounded-md border border-slate-200">
                                {f.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-blue-600" /> : <FileText className="w-4 h-4 text-slate-400" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-slate-900 truncate font-bold text-[11px] uppercase">{f.name}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Privacy & Submission</h3>
                      <p className="text-slate-500 text-xs font-medium mt-1">Select your visibility preference for this report.</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${anonymous ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Stay Anonymous</h4>
                            <p className="text-[10px] mt-1 text-slate-500 font-medium">Protect your identity from being shown to staff.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAnonymous(!anonymous)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${anonymous ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${anonymous ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 flex items-start gap-4">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-wider">
                        BY SUBMITTING THIS RECORD, YOU ATTEST THAT ALL INFORMATION IS ACCURATE AND TRUE.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="flex-1 btn-outline flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                )}
                
                {step < totalSteps ? (
                  <button
                    type="button"
                    disabled={analyzing}
                    onClick={() => setStep(s => s + 1)}
                    className="flex-[2] btn-primary flex items-center justify-center gap-2"
                  >
                    {analyzing ? 'Reviewing...' : 'Next Step'}
                    {!analyzing && <ArrowRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-primary bg-slate-900 hover:bg-black flex items-center justify-center gap-3"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                      <>
                        Finalize Submission
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;

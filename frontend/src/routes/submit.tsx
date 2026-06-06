import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  ShieldCheck,
  Sparkles,
  X,
  Copy,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LayoutDashboard, FileText as FileIcon, History, Bell, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { complaintService } from "@/lib/api";
import { toast } from "sonner";
import { formatCategory } from "@/lib/ui-shared";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [{ title: "Submit a Complaint — LASUSTECH Resolution Center" }] }),
  component: SubmitPage,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/reports", label: "My Complaints", icon: FileIcon },
  { to: "/dashboard/activity", label: "Activity", icon: History },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const STEPS = [
  { key: "what", title: "What happened?", desc: "A short description helps us route your complaint." },
  {
    key: "details",
    title: "Tell us more",
    desc: "Share the full context. Be as detailed as you'd like.",
  },
  {
    key: "evidence",
    title: "Supporting evidence",
    desc: "Optional. Attach files that support your case.",
  },
  {
    key: "review",
    title: "Review & submit",
    desc: "Make sure everything looks right before submitting.",
  },
];

interface FormState {
  category: string;
  department: string;
  urgency: string;
  summary: string;
  details: string;
  files: File[];
  anonymous: boolean;
}

function SubmitPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    category: "",
    department: "",
    urgency: "Normal",
    summary: "",
    details: "",
    files: [],
    anonymous: false,
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((current) => ({ ...current, [k]: v }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = () => {
    if (step === 0) return form.category && form.department && form.summary.length >= 10;
    if (step === 1) return form.details.length >= 30;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("title", form.summary);
      formData.append("description", form.details);
      formData.append("anonymous", String(form.anonymous));
      formData.append("priority", form.urgency.toLowerCase());
      formData.append("department", form.department);

      form.files.forEach((file) => {
        formData.append("files", file);
      });

      const result = await complaintService.submit(formData);
      setSubmittedRef(result.referenceId || result.reference_id || null);
      await queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Complaint submitted successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  if (submittedRef) return <SuccessScreen referenceId={submittedRef} />;

  return (
    <AppShell nav={nav} title="Submit a Complaint">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border/40 bg-surface/85 backdrop-blur-md p-4 shadow-soft">
          <ol className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const active = i === step;
              const complete = i < step;
              return (
                <li key={s.key} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                      complete
                        ? "border-success bg-success text-success-foreground"
                        : active
                          ? "border-accent bg-accent/10 text-primary ring-1 ring-accent/25"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {complete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`hidden text-xs font-bold uppercase tracking-wider md:inline ${active || complete ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s.title}
                  </span>
                  {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border/60" />}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8 hover-lift">
          <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
            {STEPS[step].title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{STEPS[step].desc}</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-6"
            >
              {step === 0 && <Step1 form={form} update={update} />}
              {step === 1 && <Step2 form={form} update={update} />}
              {step === 2 && <Step3 form={form} update={update} />}
              {step === 3 && <Step4 form={form} update={update} />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <button
              onClick={back}
              disabled={step === 0 || loading}
              className="inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted active:scale-95 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={!canNext() || loading}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground border border-accent/10 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95 disabled:opacity-30 disabled:-translate-y-0 disabled:shadow-none"
              >
                Continue <ChevronRight className="h-4 w-4 text-accent" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground border border-accent/15 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95 disabled:opacity-30"
              >
                {loading ? "Submitting..." : "Submit Complaint"}{" "}
                <ArrowRight className="h-4 w-4 text-accent" />
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium">
      {children}
    </label>
  );
}

function inputCls() {
  return "w-full rounded-xl border border-border bg-card px-3.5 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
}

function Step1({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const categories = [
    {
      value: "academic-result",
      label: "Academic Concern",
      desc: "Grades, delayed results, exam issues",
    },
    {
      value: "academic-lecturer",
      label: "Lecturer Conduct",
      desc: "Lecturer concern, materials, guidance",
    },
    {
      value: "facility-maint",
      label: "Campus Facilities",
      desc: "Classroom repairs, lighting, pathways",
    },
    {
      value: "facility-hostel",
      label: "Hostel & Welfare",
      desc: "Accommodation, light, water supplies",
    },
    {
      value: "admin-staff",
      label: "Administrative Process",
      desc: "Registry delays, clearances, bursary issues",
    },
    { value: "security", label: "Security & Safety", desc: "Campus safety, thefts, threats" },
    {
      value: "financial",
      label: "Financial / Payments",
      desc: "Portal payment errors, bursary processing",
    },
    {
      value: "it-service",
      label: "IT Portal Services",
      desc: "Student accounts, Wi-Fi connectivity",
    },
    { value: "other", label: "Other Issues", desc: "Any other general complaints or concerns" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-2">
        <Label>Select Category</Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const isSelected = form.category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => update("category", c.value)}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 hover:shadow-soft active:scale-[0.98] ${
                  isSelected
                    ? "border-accent bg-accent/5 ring-1 ring-accent/25"
                    : "border-border bg-card hover:border-accent/40 hover:bg-secondary/20"
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${isSelected ? "text-primary font-bold" : "text-foreground"}`}
                >
                  {c.label}
                </span>
                <span className="mt-1.5 text-[11px] text-muted-foreground leading-normal">
                  {c.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="department-select">Department</Label>
          <select
            id="department-select"
            aria-label="Department"
            className={inputCls()}
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
          >
            <option value="">Select department</option>
            <option>Faculty of Science</option>
            <option>Faculty of Engineering</option>
            <option>Student Affairs</option>
            <option>Bursary</option>
            <option>Library Services</option>
            <option>Examinations</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>How urgent is this?</Label>
          <div className="flex flex-wrap gap-2">
            {["Low", "Normal", "High", "Critical"].map((u) => {
              const isSel = form.urgency === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => update("urgency", u)}
                  className={`flex-1 min-w-[70px] text-center rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                    isSel
                      ? "border-accent bg-accent/5 text-primary ring-1 ring-accent/15"
                      : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {u}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Short summary / title</Label>
        <input
          className={inputCls()}
          placeholder="A one-line description of your concern"
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Keep it brief — you'll add more details next.
        </p>
      </div>
    </div>
  );
}

function Step2({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (form.details.length < 10) return toast.error("Write a bit more before enhancing.");
    setIsEnhancing(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${baseUrl}/ai/rewrite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("as_access_token")}`,
        },
        body: JSON.stringify({ text: form.details }),
      });
      const data = await response.json();
      if (data.success && data.data?.rewrittenText) {
        update("details", data.data.rewrittenText);
        toast.success("Text enhanced by AI!");
      } else {
        toast.error("Failed to enhance text.");
      }
    } catch (err) {
      toast.error("An error occurred while communicating with AI.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleHighlight = () => {
    const textarea = document.getElementById('details-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      toast.info("Select some text to highlight first.");
      return;
    }
    
    const selectedText = form.details.substring(start, end);
    const newText = form.details.substring(0, start) + `**[HIGHLIGHT: ${selectedText}]**` + form.details.substring(end);
    update("details", newText);
    toast.success("Text highlighted for reviewers!");
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Describe what happened</Label>
        
        {/* Rich Text / AI Toolbar */}
        <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg border border-border bg-surface/50">
          <button 
            type="button"
            onClick={handleHighlight}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="h-3 w-3 rounded-sm bg-accent/40 block border border-accent"></span>
            Highlight Important
          </button>
          
          <div className="flex-1"></div>
          
          <button 
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            {isEnhancing ? (
              <span className="animate-spin text-indigo-500">⏳</span>
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {isEnhancing ? "Enhancing..." : "Rewrite with AI"}
          </button>
        </div>

        <textarea
          id="details-textarea"
          rows={8}
          className={inputCls()}
          placeholder="Share the full context, dates, people involved, and what outcome you'd like."
          value={form.details}
          onChange={(e) => update("details", e.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>Minimum 30 characters</span>
          <span>{form.details.length} / 2000</span>
        </div>
      </div>
      {form.details.length > 30 && form.category && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div className="text-sm">
            <p className="font-medium text-accent">AI Auto-Triage Active</p>
            <p className="mt-0.5 text-muted-foreground leading-relaxed">
              Based on your description, this looks like a{" "}
              <span className="font-medium text-foreground">{form.category}</span> matter for the{" "}
              <span className="font-medium text-foreground">
                {form.department || "relevant department"}
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    update("files", [...form.files, ...files]);
  };

  return (
    <div className="space-y-4">
      <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface/60 px-6 py-10 text-center transition-all duration-300 hover:border-accent hover:bg-accent/5 shadow-soft">
        <input type="file" multiple className="hidden" onChange={handleFileChange} />
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform hover:scale-105 shadow-soft">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-primary">Click to browse or drag & drop</p>
        <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOCX · up to 25MB each</p>
      </label>

      {form.files.length > 0 && (
        <ul className="space-y-2">
          {form.files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  update(
                    "files",
                    form.files.filter((_, j) => j !== i),
                  )
                }
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        Files are encrypted at rest and only visible to authorized administrators handling your
        case.
      </div>
    </div>
  );
}

function Step4({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex items-start justify-between gap-6 border-b border-border py-3 last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{k}</span>
      <span className="max-w-md text-right text-sm">
        {v || <em className="text-muted-foreground">Not provided</em>}
      </span>
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <Row k="Category" v={formatCategory(form.category)} />
        <Row k="Department" v={form.department} />
        <Row k="Urgency" v={form.urgency} />
        <Row k="Summary" v={form.summary} />
        <Row
          k="Details"
          v={form.details.slice(0, 200) + (form.details.length > 200 ? "..." : "")}
        />
        <Row
          k="Evidence"
          v={form.files.length ? `${form.files.length} file(s) attached` : "None"}
        />
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <input
          type="checkbox"
          checked={form.anonymous}
          onChange={(e) => update("anonymous", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border"
        />
        <div className="text-sm">
          <p className="font-medium">Submit anonymously</p>
          <p className="text-muted-foreground">
            Your name and contact details won't be shown to administrators.
          </p>
        </div>
      </label>
      <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        By submitting, you confirm the information is accurate to the best of your knowledge.
      </div>
    </div>
  );
}

function SuccessScreen({ referenceId }: { referenceId: string }) {
  return (
    <AppShell nav={nav} title="Complaint submitted">
      <div className="mx-auto max-w-xl text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
        >
          <Check className="h-7 w-7" />
        </motion.div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Your complaint has been submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for reaching out. We'll review your case and respond as soon as possible.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left hover-lift shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Your reference ID</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-display text-2xl font-semibold tracking-tight">
              {referenceId}
            </span>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-muted"
              onClick={() => {
                navigator.clipboard.writeText(referenceId);
                toast.success("Reference ID copied!");
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Save this ID. Use it on the Track Case page to follow updates.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/track"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Track this case <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

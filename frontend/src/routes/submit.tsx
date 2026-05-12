import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Upload, FileText, ShieldCheck, Sparkles, X, Copy, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LayoutDashboard, FileText as FileIcon, History, Bell, Settings } from "lucide-react";
import { complaintService } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [{ title: "Submit a report — LASUSTECH Resolution Center" }] }),
  component: SubmitPage,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/reports", label: "My reports", icon: FileIcon },
  { to: "/dashboard/activity", label: "Activity", icon: History },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const STEPS = [
  { key: "what", title: "What happened?", desc: "A short description helps us route your report." },
  { key: "details", title: "Tell us more", desc: "Share the full context. Be as detailed as you'd like." },
  { key: "evidence", title: "Supporting evidence", desc: "Optional. Attach files that support your case." },
  { key: "review", title: "Review & submit", desc: "Make sure everything looks right before submitting." },
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

  const update = (k: keyof FormState, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = () => {
    if (step === 0) return form.category && form.department && form.summary.length >= 5;
    if (step === 1) return form.details.length >= 20;
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
      setSubmittedRef(result.reference_id);
      toast.success("Report submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  if (submittedRef) return <SuccessScreen referenceId={submittedRef} />;

  return (
    <AppShell nav={nav} title="Submit a report">
      <div className="mx-auto max-w-3xl">
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const active = i === step;
            const complete = i < step;
            return (
              <li key={s.key} className="flex flex-1 items-center gap-2">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                  complete ? "border-success bg-success text-success-foreground" :
                  active ? "border-accent bg-accent/10 text-accent" :
                  "border-border bg-card text-muted-foreground"
                }`}>
                  {complete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`hidden text-xs font-medium md:inline ${active || complete ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
          <h2 className="font-display text-xl font-semibold md:text-2xl">{STEPS[step].title}</h2>
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
              className="inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={!canNext() || loading}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit report"} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium">{children}</label>;
}

function inputCls() {
  return "w-full rounded-xl border border-border bg-card px-3.5 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
}

function Step1({ form, update }: { form: FormState; update: (k: keyof FormState, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <select className={inputCls()} value={form.category} onChange={(e) => update("category", e.target.value)}>
            <option value="">Select a category</option>
            <option>Academic concern</option>
            <option>Administrative issue</option>
            <option>Campus facility</option>
            <option>Hostel & welfare</option>
            <option>Financial / payments</option>
            <option>Other</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Department</Label>
          <select className={inputCls()} value={form.department} onChange={(e) => update("department", e.target.value)}>
            <option value="">Select department</option>
            <option>Faculty of Science</option>
            <option>Faculty of Engineering</option>
            <option>Student Affairs</option>
            <option>Bursary</option>
            <option>Library Services</option>
            <option>Examinations</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>How urgent is this?</Label>
        <div className="flex flex-wrap gap-2">
          {["Low", "Normal", "High", "Critical"].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => update("urgency", u)}
              className={`rounded-xl border px-4 py-2 text-sm transition ${
                form.urgency === u ? "border-accent bg-accent/10 text-accent" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Short summary</Label>
        <input
          className={inputCls()}
          placeholder="A one-line description of your concern"
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Keep it brief — you'll add more details next.</p>
      </div>
    </div>
  );
}

function Step2({ form, update }: { form: FormState; update: (k: keyof FormState, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Describe what happened</Label>
        <textarea
          rows={9}
          className={inputCls()}
          placeholder="Share the full context, dates, people involved, and what outcome you'd like."
          value={form.details}
          onChange={(e) => update("details", e.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Minimum 20 characters</span>
          <span>{form.details.length} / 2000</span>
        </div>
      </div>
      {form.details.length > 30 && form.category && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div className="text-sm">
            <p className="font-medium">Suggested category</p>
            <p className="mt-0.5 text-muted-foreground">
              Based on your description, this looks like a <span className="font-medium text-foreground">{form.category}</span> matter for the <span className="font-medium text-foreground">{form.department || "relevant department"}</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({ form, update }: { form: FormState; update: (k: keyof FormState, v: any) => void }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    update("files", [...form.files, ...files]);
  };

  return (
    <div className="space-y-4">
      <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface px-6 py-10 text-center transition hover:border-accent/50 hover:bg-accent/5">
        <input type="file" multiple className="hidden" onChange={handleFileChange} />
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">Click to browse or drag & drop</p>
        <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOCX · up to 25MB each</p>
      </label>

      {form.files.length > 0 && (
        <ul className="space-y-2">
          {form.files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              <button
                onClick={() => update("files", form.files.filter((_, j) => j !== i))}
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
        Files are encrypted at rest and only visible to authorized administrators handling your case.
      </div>
    </div>
  );
}

function Step4({ form, update }: { form: FormState; update: (k: keyof FormState, v: any) => void }) {
  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex items-start justify-between gap-6 border-b border-border py-3 last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{k}</span>
      <span className="max-w-md text-right text-sm">{v || <em className="text-muted-foreground">Not provided</em>}</span>
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <Row k="Category" v={form.category} />
        <Row k="Department" v={form.department} />
        <Row k="Urgency" v={form.urgency} />
        <Row k="Summary" v={form.summary} />
        <Row k="Details" v={form.details.slice(0, 200) + (form.details.length > 200 ? "..." : "")} />
        <Row k="Evidence" v={form.files.length ? `${form.files.length} file(s) attached` : "None"} />
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
          <p className="text-muted-foreground">Your name and contact details won't be shown to administrators.</p>
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
    <AppShell nav={nav} title="Report submitted">
      <div className="mx-auto max-w-xl text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success"
        >
          <Check className="h-7 w-7" />
        </motion.div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Your report has been submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for reaching out. We'll review your case and respond as soon as possible.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Your reference ID</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-display text-2xl font-semibold tracking-tight">{referenceId}</span>
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
          <Link to="/track" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Track this case <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted">
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

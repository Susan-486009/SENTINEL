import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { complaintService, type Complaint } from "@/lib/api";
import { formatCategory } from "@/lib/ui-shared";
import { toast } from "sonner";
import { format } from "date-fns";

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track a complaint — LASUSTECH Resolution Center" }] }),
  component: TrackPage,
});

const STAGES = [
  { key: "pending", label: "Submitted", desc: "Complaint received and reference ID issued." },
  { key: "in_review", label: "Under review", desc: "Initial review by the resolution office." },
  { key: "resolved", label: "Resolved", desc: "Outcome shared and complaint closed." },
  { key: "fixed", label: "Fixed", desc: "Issue has been physically or technically fixed." },
];

function TrackPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Complaint | null>(null);

  const performSearch = async (targetId: string) => {
    if (!targetId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await complaintService.track(targetId.trim().toUpperCase());
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Complaint not found");
    } finally {
      setLoading(false);
    }
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(id);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("id");
      if (queryId) {
        setId(queryId.toUpperCase());
        performSearch(queryId.toUpperCase());
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Transparent complaint tracking
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">Track your complaint</h1>
          <p className="mt-3 text-muted-foreground">
            Enter the reference ID you received when you submitted your complaint.
          </p>
        </div>

        <form
          onSubmit={search}
          className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-card sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5">
            <Search className="h-4.5 w-4.5 text-muted-foreground" />
            <input
              value={id}
              onChange={(e) => {
                const formatted = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9-]/g, "");
                setId(formatted);
              }}
              placeholder="e.g. RC-48201"
              className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <button
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Searching..." : "Track complaint"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mx-auto mt-10 max-w-3xl">
          {loading && <TrackSkeleton />}
          {result && <TrackResult data={result} />}
          {!loading && !result && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">No complaint loaded yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Don't have a reference ID?{" "}
                <Link to="/submit" className="font-medium text-accent hover:underline">
                  Submit a new complaint
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function TrackSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

function TrackResult({ data }: { data: Complaint }) {
  const currentStageIndex = STAGES.findIndex((s) => s.key === data.status);
  const isRejected = data.status === "rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft hover-lift">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isRejected ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                }`}
              >
                {data.status.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">Complaint #{data.reference_id}</span>
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold">{data.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCategory(data.category)} · Submitted {format(new Date(data.created_at), "PPP")}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Last updated {format(new Date(data.updated_at), "p")}
          </div>
        </div>
      </div>

      {/* Official Admin Feedback Reply */}
      {(data.admin_feedback || data.adminFeedback) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent/25 bg-accent/5 p-6 shadow-soft hover-lift"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent">
              Official Administrator Reply
            </h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground font-medium">
            {data.admin_feedback || data.adminFeedback}
          </p>
        </motion.div>
      )}

      {/* Student Satisfaction Survey */}
      {(data.status === "resolved" || data.status === "fixed") && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SatisfactionSurvey complaint={data} />
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 hover-lift shadow-soft">
          <h3 className="font-display text-base font-bold text-primary">Progress Timeline</h3>
          <ol className="mt-5 space-y-5">
            {STAGES.map((s, i) => {
              const done = i < currentStageIndex;
              const active = i === currentStageIndex;
              return (
                <li key={s.key} className="flex items-start gap-4">
                  <div className="relative">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 ${
                        done
                          ? "border-success bg-success text-success-foreground shadow-soft"
                          : active
                            ? "border-accent bg-accent/15 text-primary ring-4 ring-accent/20 font-bold shadow-soft"
                            : "border-border bg-muted/30 text-muted-foreground/60"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </div>
                    {i < STAGES.length - 1 && (
                      <span className="absolute left-1/2 top-7 h-9 w-px -translate-x-1/2 bg-border/50" />
                    )}
                  </div>
                  <div className="pb-1">
                    <div
                      className={`text-sm font-semibold ${done || active ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {s.label}
                    </div>
                    <div className="text-[11px] leading-normal text-muted-foreground">{s.desc}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 hover-lift shadow-soft">
          <h3 className="font-display text-base font-semibold">Activity log</h3>
          <div className="mt-5 space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {data.timeline?.length > 0 ? (
              [...data.timeline].reverse().map((t: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{t.text}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(t.created_at), "Pp")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground italic">
                No detailed activity yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {isRejected && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 flex items-start gap-4">
          <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-base font-semibold text-destructive">Complaint Rejected</h3>
            <p className="mt-1 text-sm text-destructive/80">
              This complaint has been rejected and closed. Please contact the administration if you
              believe this is an error.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 hover-lift shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold">
            <MessageSquare className="h-4 w-4 text-accent" /> Description
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">{data.description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 hover-lift shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold">
            <Paperclip className="h-4 w-4 text-accent" /> Evidence
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.files.length > 0 ? (
              data.files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <a
                    href={`${SERVER_URL}${file.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent truncate"
                  >
                    {file.originalName}
                  </a>
                  <span className="text-xs text-muted-foreground ml-2">
                    {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground italic">No evidence attached</li>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function SatisfactionSurvey({ complaint }: { complaint: Complaint }) {
  const [satisfied, setSatisfied] = useState<"yes" | "no" | null>(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(
    complaint.satisfaction_feedback || complaint.satisfactionFeedback || null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!satisfied) return;
    setSubmitting(true);
    try {
      const updated = await complaintService.submitFeedback(complaint._id || complaint.id || "", {
        satisfied,
        comments,
      });
      setSubmittedData({
        satisfied,
        comments,
        submitted_at: new Date().toISOString(),
      });
      toast.success("Feedback submitted! Thank you.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedData) {
    const isSat = submittedData.satisfied === "yes";
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
        <h3 className="mt-3 font-display font-semibold text-foreground">
          Satisfaction Feedback Received
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Thank you for helping us improve LASUSTECH Resolution Center!
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 text-sm font-medium">
          <span>Resolution:</span>
          <span className={isSat ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
            {isSat ? "Satisfied 😄" : "Not Satisfied 😞"}
          </span>
        </div>
        {submittedData.comments && (
          <p className="mt-3 text-xs italic text-muted-foreground">
            &ldquo;{submittedData.comments}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
      <div className="space-y-1">
        <h3 className="font-display text-base font-semibold text-foreground">
          Was this resolved to your satisfaction?
        </h3>
        <p className="text-xs text-muted-foreground">
          Your feedback is anonymous and helps us improve our school resolution services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSatisfied("yes")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
              satisfied === "yes"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold"
                : "border-border hover:bg-muted"
            }`}
          >
            😄 Yes, Satisfied
          </button>
          <button
            type="button"
            onClick={() => setSatisfied("no")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
              satisfied === "no"
                ? "border-rose-500 bg-rose-500/10 text-rose-600 font-bold"
                : "border-border hover:bg-muted"
            }`}
          >
            😞 No, Needs Improvement
          </button>
        </div>

        {satisfied === "no" && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-semibold text-muted-foreground">
              What can we improve or follow up on?
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Please let us know what went wrong or how we can do better..."
              className="min-h-[80px] w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-accent"
              required
            />
          </div>
        )}

        {satisfied === "yes" && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-semibold text-muted-foreground">
              Additional comments (optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional feedback or thank you notes..."
              className="min-h-[80px] w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-accent"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !satisfied}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}

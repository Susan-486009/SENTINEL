import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { complaintService, type Complaint } from "@/lib/api";
import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  MessageSquare,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { formatCategory, StatusBadge } from "@/lib/ui-shared";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reports/$id")({
  head: () => ({ meta: [{ title: "Complaint Details — LASUSTECH Resolution Center" }] }),
  component: ReportDetailPage,
});

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");

const STAGES = [
  { key: "pending", label: "Submitted", desc: "Complaint received and reference ID issued." },
  { key: "in_review", label: "Under review", desc: "Initial review by the resolution office." },
  { key: "resolved", label: "Resolved", desc: "Outcome shared and case closed." },
];

function ReportDetailPage() {
  const { id } = Route.useParams();

  const {
    data: complaint,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["complaint-detail", id],
    queryFn: () => complaintService.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <h3 className="mt-3 font-semibold text-destructive">Failed to load complaint</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
        <Link
          to="/dashboard/reports"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to complaints
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === complaint.status);
  const isRejected = complaint.status === "rejected";

  const getStatusTone = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_review":
        return "accent";
      case "resolved":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "muted";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/reports"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            Complaint Details
          </h1>
          <p className="text-xs text-muted-foreground">
            Reference ID: <span className="font-mono font-bold text-accent">#{complaint.reference_id || complaint.referenceId}</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={getStatusTone(complaint.status)}>
                {complaint.status.replace("_", " ").toUpperCase()}
              </StatusBadge>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground capitalize">
                {formatCategory(complaint.category)}
              </span>
            </div>
            <h2 className="mt-2 font-display text-lg sm:text-xl font-bold text-foreground">
              {complaint.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Submitted {format(new Date(complaint.created_at || complaint.createdAt || Date.now()), "PPP")}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Last updated {format(new Date(complaint.updated_at || complaint.updatedAt || Date.now()), "p")}
          </div>
        </div>
      </div>

      {/* Official Admin Feedback Reply */}
      {(complaint.admin_feedback || complaint.adminFeedback) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent/25 bg-accent/5 p-6 shadow-soft"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent">
              Official Administrator Reply
            </h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground font-medium font-display">
            {complaint.admin_feedback || complaint.adminFeedback}
          </p>
        </motion.div>
      )}

      {/* Student Satisfaction Survey */}
      {complaint.status === "resolved" && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SatisfactionSurvey complaint={complaint} />
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Progress Timeline</h3>
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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Activity log</h3>
          <div className="mt-5 space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {complaint.timeline?.length > 0 ? (
              [...complaint.timeline].reverse().map((t: any, i: number) => (
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="h-4 w-4 text-accent" /> Description
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{complaint.description}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Paperclip className="h-4 w-4 text-accent" /> Evidence Files
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {complaint.files && complaint.files.length > 0 ? (
              complaint.files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <a
                    href={`${SERVER_URL}${file.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent truncate font-medium"
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
    </div>
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
      await complaintService.submitFeedback(complaint._id || complaint.id || "", {
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
          Your feedback helps us monitor and improve our resolution speed and quality.
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

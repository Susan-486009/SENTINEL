import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText, Paperclip, MessageSquare, CheckCircle2, Clock, ShieldCheck, ArrowRight, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { complaintService, type Complaint } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track a case — LASUSTECH Resolution Center" }] }),
  component: TrackPage,
});

const STAGES = [
  { key: "pending", label: "Submitted", desc: "Report received and reference ID issued." },
  { key: "in_review", label: "Under review", desc: "Initial review by the resolution office." },
  { key: "resolved", label: "Resolved", desc: "Outcome shared and case closed." },
];

function TrackPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Complaint | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await complaintService.track(id.trim().toUpperCase());
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Case not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Transparent case tracking
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">Track your case</h1>
          <p className="mt-3 text-muted-foreground">
            Enter the reference ID you received when you submitted your report.
          </p>
        </div>

        <form onSubmit={search} className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-card sm:flex-row">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5">
            <Search className="h-4.5 w-4.5 text-muted-foreground" />
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. RC-48201"
              className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <button 
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Searching..." : "Track case"} <ArrowRight className="h-4 w-4" />
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
              <h3 className="mt-4 font-display text-lg font-semibold">No case loaded yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Don't have a reference ID? <Link to="/submit" className="font-medium text-accent hover:underline">Submit a new report</Link>.
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
  const currentStageIndex = STAGES.findIndex(s => s.key === data.status);
  const isRejected = data.status === 'rejected';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isRejected ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
              }`}>
                {data.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">Case #{data.reference_id}</span>
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold">{data.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{data.category} · Submitted {format(new Date(data.created_at), 'PPP')}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Last updated {format(new Date(data.updated_at), 'p')}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold">Progress timeline</h3>
          <ol className="mt-5 space-y-5">
            {STAGES.map((s, i) => {
              const done = i < currentStageIndex;
              const active = i === currentStageIndex;
              return (
                <li key={s.key} className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                      done ? "border-success bg-success text-success-foreground" :
                      active ? "border-accent bg-accent/10 text-accent" :
                      "border-border bg-background text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                    </div>
                    {i < STAGES.length - 1 && <span className="absolute left-1/2 top-7 h-9 w-px -translate-x-1/2 bg-border" />}
                  </div>
                  <div className="pb-1">
                    <div className={`text-sm font-medium ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold">Activity log</h3>
          <div className="mt-5 space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {data.timeline?.length > 0 ? [...data.timeline].reverse().map((t: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <p className="text-xs font-medium text-foreground">{t.text}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(t.created_at), 'Pp')}</p>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-xs text-muted-foreground italic">No detailed activity yet.</div>
            )}
          </div>
        </div>
      </div>

      {isRejected && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 flex items-start gap-4">
          <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-base font-semibold text-destructive">Case Rejected</h3>
            <p className="mt-1 text-sm text-destructive/80">
              This case has been rejected and closed. Please contact the administration if you believe this is an error.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold">
            <MessageSquare className="h-4 w-4 text-accent" /> Description
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            {data.description}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold">
            <Paperclip className="h-4 w-4 text-accent" /> Evidence
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.files.length > 0 ? data.files.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                <a 
                  href={`http://localhost:5000${file.url}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-accent truncate"
                >
                  {file.originalName}
                </a>
                <span className="text-xs text-muted-foreground ml-2">{(file.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            )) : (
              <li className="text-sm text-muted-foreground italic">No evidence attached</li>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  Paperclip,
  Send,
  MoreHorizontal,
  User,
  Calendar,
  Building2,
  ShieldCheck,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { adminNav, StatusBadge, formatCategory } from "@/lib/ui-shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintService, type Complaint } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");

export const Route = createFileRoute("/admin/cases")({
  head: () => ({ meta: [{ title: "Cases — Admin" }] }),
  component: CasesPage,
});

const filters = ["All", "Pending", "In review", "Resolved", "Fixed", "Rejected"];

function CasesPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [noteText, setNoteText] = useState("");
  const [replyText, setReplyText] = useState("");

  const { data: cases, isLoading: listLoading } = useQuery({
    queryKey: ["all-complaints"],
    queryFn: () => complaintService.getAll(),
  });

  const { data: active, isLoading: detailLoading } = useQuery({
    queryKey: ["complaint-detail", selectedId],
    queryFn: () => complaintService.getById(selectedId!),
    enabled: !!selectedId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminFeedback }: { id: string; status: string; adminFeedback?: string }) =>
      complaintService.updateStatus(id, status, adminFeedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-detail", selectedId] });
      setReplyText("");
      toast.success("Case updated successfully");
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: string }) =>
      complaintService.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-detail", selectedId] });
      toast.success("Priority updated");
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      complaintService.addInternalNote(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint-detail", selectedId] });
      setNoteText("");
      toast.success("Note added");
    },
  });

  const aiEnhanceMutation = useMutation({
    mutationFn: async (text: string) => {
      const token = localStorage.getItem("as_access_token") || localStorage.getItem("token");
      const res = await fetch(`${SERVER_URL}/ai/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to enhance text");
      return data.data.rewrittenText;
    },
    onSuccess: (enhancedText) => {
      setReplyText(enhancedText);
      toast.success("Text enhanced with AI");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to connect to AI service.");
    }
  });

  const filtered = useMemo(() => {
    if (!cases) return [];
    return cases.filter((c) => {
      const matchesFilter =
        filter === "All" || c.status.toLowerCase().replace("_", " ") === filter.toLowerCase();
      const matchesQuery =
        query === "" ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.reference_id.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [cases, filter, query]);

  const isLoading = listLoading;

  const getStatusTone = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_review":
        return "accent";
      case "resolved":
      case "fixed":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "muted";
    }
  };

  const getPriorityTone = (priority: string) => {
    switch (priority) {
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "normal":
        return "accent";
      case "low":
        return "muted";
      default:
        return "muted";
    }
  };

  return (
    <AppShell nav={adminNav} title="Cases">
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cases..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : (
              filtered.map((c) => {
                const isActive = selectedId === c._id;
                return (
                  <li
                    key={c._id}
                    onClick={() => setSelectedId(c._id)}
                    className={`cursor-pointer px-4 py-4 transition ${isActive ? "bg-accent/5" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">#{c.reference_id}</span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge tone={getStatusTone(c.status)}>
                          {c.status.replace("_", " ").toUpperCase()}
                        </StatusBadge>
                      </div>
                    </div>
                    <div className="mt-1.5 line-clamp-1 font-medium">{c.title}</div>
                    <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatCategory(c.category)}</span>
                      <span>{format(new Date(c.created_at), "MMM d")}</span>
                    </div>
                  </li>
                );
              })
            )}
            {!isLoading && filtered.length === 0 && (
              <li className="p-10 text-center text-sm text-muted-foreground">No cases found.</li>
            )}
          </ul>
        </div>

        {/* Detail */}
        {active ? (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={getStatusTone(active.status)}>
                      {active.status.replace("_", " ").toUpperCase()}
                    </StatusBadge>
                    <StatusBadge tone={getPriorityTone(active.priority)}>
                      {active.priority.toUpperCase()}
                    </StatusBadge>
                    <span className="text-xs text-muted-foreground">#{active.referenceId}</span>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-semibold">{active.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />{" "}
                      {active.anonymous ? "Anonymous" : active.submitter?.name || "Student"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> {formatCategory(active.category)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Submitted{" "}
                      {format(new Date(active.created_at), "PPP")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                      Status
                    </span>
                    <select
                      className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs"
                      value={active.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({ id: active._id, status: e.target.value })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="fixed">Fixed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                      Priority
                    </span>
                    <select
                      className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs"
                      value={active.priority}
                      onChange={(e) =>
                        updatePriorityMutation.mutate({ id: active._id, priority: e.target.value })
                      }
                      disabled={updatePriorityMutation.isPending}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <button className="rounded-xl border border-border bg-surface p-2.5 hover:bg-muted mt-4">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <Section title="Issue summary">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {active.description}
                  </p>
                </Section>

                <Section title="Activity Timeline">
                  <ol className="space-y-4">
                    {active.timeline?.map((t: any, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-accent" />
                        <div>
                          <div className="text-sm font-medium">{t.text}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(t.created_at), "Pp")}
                            {t.user_id && ` by ${t.user_id.name}`}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Section>

                <Section title="Official Response / Reply (Visible to Student)">
                  <div className="space-y-3">
                    {(active.admin_feedback || active.adminFeedback) && (
                      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
                        <div className="mb-1 text-[10px] text-accent font-bold uppercase tracking-wider">
                          Current Official Reply
                        </div>
                        <p className="text-foreground font-medium leading-relaxed">
                          {active.admin_feedback || active.adminFeedback}
                        </p>
                      </div>
                    )}

                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Draft Reply</label>
                        <button
                          onClick={() => aiEnhanceMutation.mutate(replyText)}
                          disabled={aiEnhanceMutation.isPending || !replyText.trim() || replyText.trim().length < 5}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/10 transition disabled:opacity-50"
                        >
                          {aiEnhanceMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Enhance with AI
                        </button>
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your official reply, follow-up, or resolution notes to the student here..."
                        className="h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <div className="flex items-center justify-between border-t border-border pt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground font-semibold">Change Status To:</span>
                          <select
                            className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold"
                            value={active.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                id: active._id,
                                status: e.target.value,
                                adminFeedback: replyText,
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_review">In Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="fixed">Fixed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: active._id,
                              status: active.status,
                              adminFeedback: replyText,
                            })
                          }
                          disabled={updateStatusMutation.isPending || !replyText.trim()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>

                <Section title="Internal notes">
                  <div className="space-y-3">
                    {active.internalNotes?.map((note: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border bg-surface p-4 text-sm"
                      >
                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {note.admin_id?.name || "Admin"}
                          </span>{" "}
                          · {format(new Date(note.created_at), "Pp")}
                        </div>
                        {note.text}
                      </div>
                    ))}

                    <div className="rounded-xl border border-border bg-surface p-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add an internal note (only visible to administrators)..."
                        className="h-20 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <div className="flex items-center justify-between border-t border-border pt-2">
                        <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
                          <Paperclip className="h-3.5 w-3.5" /> Attach
                        </button>
                        <button
                          onClick={() => addNoteMutation.mutate({ id: active._id, text: noteText })}
                          disabled={addNoteMutation.isPending || !noteText.trim()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {addNoteMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Post note
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              <div className="space-y-6">
                <Section title="Evidence">
                  <ul className="space-y-2 text-sm">
                    {active.files?.length > 0 ? (
                      active.files.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                        >
                          <a
                            href={`${SERVER_URL}${f.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate hover:text-accent"
                          >
                            {f.originalName}
                          </a>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-muted-foreground italic">No evidence provided</li>
                    )}
                  </ul>
                </Section>

                {(active.satisfaction_feedback || active.satisfactionFeedback) && (
                  <Section title="Student Satisfaction">
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-3 shadow-soft">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Student Rating
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            (active.satisfaction_feedback?.satisfied ||
                              active.satisfactionFeedback?.satisfied) === "yes"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          }`}
                        >
                          {(active.satisfaction_feedback?.satisfied ||
                            active.satisfactionFeedback?.satisfied) === "yes"
                            ? "😄 Satisfied"
                            : "😞 Unsatisfied"}
                        </span>
                      </div>
                      {(active.satisfaction_feedback?.comments ||
                        active.satisfactionFeedback?.comments) && (
                        <p className="text-xs leading-normal italic text-muted-foreground bg-card border border-border rounded-lg p-2.5">
                          &ldquo;
                          {active.satisfaction_feedback?.comments ||
                            active.satisfactionFeedback?.comments}
                          &rdquo;
                        </p>
                      )}
                      <div className="text-[10px] text-muted-foreground font-mono text-right">
                        Submitted:{" "}
                        {format(
                          new Date(
                            active.satisfaction_feedback?.submitted_at ||
                              active.satisfactionFeedback?.submitted_at ||
                              Date.now(),
                          ),
                          "MMM dd, yyyy HH:mm",
                        )}
                      </div>
                    </div>
                  </Section>
                )}

                <Section title="System Audit">
                  <div className="space-y-2 text-sm">
                    <Row k="Department" v={formatCategory(active.category)} />
                    <Row k="Anonymous" v={active.anonymous ? "Yes" : "No"} />
                    {!active.anonymous && (
                      <>
                        <Row k="Matric" v={active.submitter?.matric || "N/A"} />
                        <Row k="Email" v={active.submitter?.email || "N/A"} />
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" /> All actions are
                    audit-logged
                  </div>
                </Section>
              </div>
            </div>
          </div>
        ) : detailLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Loading details...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card">
            <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Select a case to view details</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

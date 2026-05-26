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
  AlertTriangle,
  ChevronDown,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  CornerDownRight,
  Database,
  ArrowRight,
  FileText
} from "lucide-react";
import { StatusBadge, formatCategory } from "@/lib/ui-shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintService, type Complaint } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");

function safeFormatDate(dateStr: string | Date | undefined | null, formatStr: string, fallback: string = "N/A"): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch (e) {
    return fallback;
  }
}

export const Route = createFileRoute("/superadmin/cases")({
  head: () => ({ meta: [{ title: "Platform Cases — Administrator Panel" }] }),
  component: CasesPage,
});

const filters = ["All", "Pending", "In review", "Resolved", "Fixed", "Rejected"];

// Color mappings for different categories to give visual pops
function getCategoryStyle(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("academic")) return "bg-blue-500/10 text-blue-400 border-blue-500/15";
  if (cat.includes("hostel") || cat.includes("facilities")) return "bg-purple-500/10 text-purple-400 border-purple-500/15";
  if (cat.includes("finance") || cat.includes("bursary")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/15";
  return "bg-zinc-500/10 text-zinc-400 border-zinc-500/15";
}

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
      toast.success("Complaint status updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: string }) =>
      complaintService.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-detail", selectedId] });
      toast.success("Priority updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update priority"),
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      complaintService.addInternalNote(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint-detail", selectedId] });
      setNoteText("");
      toast.success("Internal note logged");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add note"),
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
      toast.success("Official reply optimized with AI rewriting");
    },
    onError: (err: any) => {
      toast.error(err.message || "AI rewriter service is currently unreachable.");
    }
  });

  const casesList = useMemo(() => {
    return Array.isArray(cases) ? cases : (cases as any)?.data || [];
  }, [cases]);

  const filtered = useMemo(() => {
    return casesList.filter((c) => {
      const status = c.status || "pending";
      const title = c.title || "";
      const refId = c.reference_id || c.referenceId || "";

      const matchesFilter =
        filter === "All" || status.toLowerCase().replace("_", " ") === filter.toLowerCase();
      const matchesQuery =
        query === "" ||
        title.toLowerCase().includes(query.toLowerCase()) ||
        refId.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [casesList, filter, query]);

  const getStatusTone = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "in_review": return "accent";
      case "resolved":
      case "fixed": return "success";
      case "rejected": return "danger";
      default: return "muted";
    }
  };

  const getPriorityTone = (priority: string) => {
    switch (priority) {
      case "critical": return "danger";
      case "high": return "warning";
      case "normal": return "accent";
      case "low": return "muted";
      default: return "muted";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid h-[calc(100vh-7.5rem)] grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        
        {/* Left Column - Beautiful Case list */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="border-b border-border p-4 space-y-3 bg-muted/20">
            {/* Elegant Search with glow rings */}
            <div className="relative flex items-center rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-300">
              <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by case title, ID, tag..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              />
            </div>
            
            {/* Dynamic capsule selectors without horizontal scrollbar track */}
            <div 
              className="flex items-center gap-1.5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
                    filter === f
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Clean scrolling list */}
          <ul className="flex-1 divide-y divide-border/60 overflow-y-auto bg-muted/5">
            {listLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <Loader2 className="animate-spin h-7 w-7 text-primary mb-2" />
                <span className="text-xs">Fetching active registry...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 opacity-20 mb-2" />
                <span className="text-sm font-semibold">No registry records found</span>
                <span className="text-xs mt-1 opacity-70">Try relaxing your search descriptors</span>
              </div>
            ) : (
              filtered.map((c) => {
                const isActive = selectedId === c._id;
                return (
                  <motion.li
                    key={c._id}
                    onClick={() => setSelectedId(c._id)}
                    whileHover={{ x: 3 }}
                    className={`cursor-pointer px-5 py-4.5 transition-all duration-200 border-l-2 relative ${
                      isActive 
                        ? "bg-primary/[0.03] border-primary" 
                        : "hover:bg-muted/30 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] tracking-wider text-muted-foreground font-semibold uppercase">
                        #{c.reference_id || c.referenceId || "N/A"}
                      </span>
                      <StatusBadge tone={getStatusTone(c.status || "pending")}>
                        {(c.status || "pending").replace("_", " ").toUpperCase()}
                      </StatusBadge>
                    </div>
                    <div className="mt-2 line-clamp-1 font-semibold text-sm text-foreground hover:text-primary transition-colors">
                      {c.title || "Untitled Issue"}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-medium ${getCategoryStyle(c.category)}`}>
                        {formatCategory(c.category)}
                      </span>
                      <span className="font-medium text-[10.5px]">
                        {safeFormatDate(c.created_at, "MMM d, yyyy")}
                      </span>
                    </div>
                  </motion.li>
                );
              })
            )}
          </ul>
        </div>

        {/* Right Column - Beautiful splits workspace */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div 
                key={active._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
              >
                {/* Header card area */}
                <div className="border-b border-border p-6 bg-muted/10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-border">
                          #{active.referenceId || active.reference_id || "N/A"}
                        </span>
                        <StatusBadge tone={getStatusTone(active.status || "pending")}>
                          {(active.status || "pending").replace("_", " ").toUpperCase()}
                        </StatusBadge>
                        <StatusBadge tone={getPriorityTone(active.priority || "normal")}>
                          {(active.priority || "normal").toUpperCase()}
                        </StatusBadge>
                      </div>
                      <h2 className="font-display text-xl font-bold tracking-tight text-foreground leading-snug">
                        {active.title || "Untitled Complaint"}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 opacity-60 text-primary" />{" "}
                          {active.anonymous ? (
                            <span className="inline-flex items-center gap-1 text-amber-400/90 font-medium">
                              <AlertTriangle className="h-3 w-3" /> Anonymous Student
                            </span>
                          ) : (
                            <span className="font-semibold text-foreground">{active.submitter?.name || "Student Submittee"}</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 opacity-60" /> {formatCategory(active.category)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-60" /> Submitted {safeFormatDate(active.created_at, "PPP")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split main area (70% workspace, 30% control sidebar) */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden">
                  
                  {/* Left Workspace Panel - Issues & Actions (2 columns) */}
                  <div className="md:col-span-2 overflow-y-auto p-6 space-y-6">
                    
                    {/* Summary */}
                    <div className="rounded-xl border border-border bg-muted/15 p-5 space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" /> Incident Summary Description
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground select-text font-medium whitespace-pre-wrap">
                        {active.description || "No description provided."}
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-accent" /> Resolution Activity Timeline
                      </h3>
                      <ol className="relative border-l border-border/80 ml-2.5 pl-5 space-y-5">
                        {active.timeline?.map((t: any, i: number) => (
                          <li key={i} className="relative group">
                            {/* Connectors */}
                            <div className="absolute -left-[25px] mt-1 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card ring-4 ring-accent/10 transition-transform group-hover:scale-110" />
                            <div className="space-y-0.5">
                              <div className="text-sm font-semibold text-foreground leading-none">{t.text || "Timeline Action"}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                                <span>{safeFormatDate(t.created_at, "Pp")}</span>
                                {t.user_id && (
                                  <>
                                    <span className="opacity-30">|</span>
                                    <span className="text-primary/95 flex items-center gap-1">
                                      <User className="h-3 w-3" /> {t.user_id.name} ({t.user_id.role})
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Action form */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <CornerDownRight className="h-3.5 w-3.5 text-accent" /> Official Resolution Reply (Student Visible)
                        </h3>
                        {/* Shimmer AI button */}
                        <button
                          onClick={() => aiEnhanceMutation.mutate(replyText)}
                          disabled={aiEnhanceMutation.isPending || !replyText.trim() || replyText.trim().length < 5}
                          className="relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 transition active:scale-95 shadow-md shadow-indigo-500/10 overflow-hidden group"
                        >
                          {aiEnhanceMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          AI Copy Rewrite
                        </button>
                      </div>

                      {/* Display current reply card */}
                      {(active.admin_feedback || active.adminFeedback) && (
                        <div className="rounded-xl border border-success/15 bg-success/5 p-4 text-xs space-y-1">
                          <div className="text-[10px] text-success font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Dispatched Resolution Reply
                          </div>
                          <p className="text-foreground font-medium leading-relaxed">
                            {active.admin_feedback || active.adminFeedback}
                          </p>
                        </div>
                      )}

                      {/* AI Draft quick toggle */}
                      {active.aiDraftReply && !(active.admin_feedback || active.adminFeedback) && (
                        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs relative space-y-1">
                          <button
                            onClick={() => setReplyText(active.aiDraftReply)}
                            className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2 py-1 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                          >
                            Apply Draft
                          </button>
                          <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Pre-Synthesized AI Recommendation
                          </div>
                          <p className="text-muted-foreground leading-relaxed pr-20 italic">
                            "{active.aiDraftReply}"
                          </p>
                        </div>
                      )}

                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Draft your official dispatch response, feedback instructions, or case final resolution to students here..."
                        className="w-full h-24 rounded-lg border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none transition"
                      />

                      <div className="flex items-center justify-between border-t border-border/80 pt-3 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-semibold">Change State To:</span>
                          <select
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold cursor-pointer focus:border-primary"
                            value={active.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                id: active._id,
                                status: e.target.value,
                                adminFeedback: replyText || undefined,
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
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 transition active:scale-95"
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

                    {/* Internal Notes */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-accent" /> Private Internal Annotations (Admins Only)
                      </h3>

                      <div className="space-y-3">
                        {active.internalNotes?.map((note: any, i: number) => (
                          <div
                            key={i}
                            className="rounded-xl border border-border/80 bg-muted/10 p-4 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span className="font-bold text-foreground">{note.admin_id?.name || "Administrator"}</span>
                              <span className="font-medium">{safeFormatDate(note.created_at, "Pp")}</span>
                            </div>
                            <p className="text-foreground/90 leading-relaxed font-medium">{note.text}</p>
                          </div>
                        ))}

                        <div className="rounded-xl border border-border bg-muted/10 p-3 space-y-3">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add administrative notes, assignment details, or internal briefs..."
                            className="w-full h-16 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary placeholder:text-muted-foreground/80 resize-none transition"
                          />
                          <div className="flex items-center justify-between">
                            <button 
                              type="button" 
                              onClick={() => toast.info("Evidence attaching is coming in platform release v2")} 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-[10px] font-semibold text-muted-foreground transition"
                            >
                              <Paperclip className="h-3 w-3" /> Attach private file
                            </button>
                            <button
                              onClick={() => addNoteMutation.mutate({ id: active._id, text: noteText })}
                              disabled={addNoteMutation.isPending || !noteText.trim()}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition active:scale-95"
                            >
                              {addNoteMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                              Save Private Note
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Control Sidebar (1 column) */}
                  <div className="overflow-y-auto p-6 space-y-6 bg-muted/5">
                    
                    {/* Quick Config Cards */}
                    <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                        Control Board
                      </div>
                      
                      {/* Status select card */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Case Status
                        </label>
                        <div className="relative">
                          <select
                            className="w-full rounded-xl border border-border bg-background pl-3 pr-8 py-2 text-xs font-bold cursor-pointer focus:border-primary outline-none appearance-none"
                            value={active.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({ id: active._id, status: e.target.value })
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="pending">Pending Dispatch</option>
                            <option value="in_review">In Active Review</option>
                            <option value="resolved">Mark Resolved</option>
                            <option value="fixed">Mark Fixed</option>
                            <option value="rejected">Mark Rejected</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      {/* Priority select card */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Response Severity
                        </label>
                        <div className="relative">
                          <select
                            className="w-full rounded-xl border border-border bg-background pl-3 pr-8 py-2 text-xs font-bold cursor-pointer focus:border-primary outline-none appearance-none"
                            value={active.priority}
                            onChange={(e) =>
                              updatePriorityMutation.mutate({ id: active._id, priority: e.target.value })
                            }
                            disabled={updatePriorityMutation.isPending}
                          >
                            <option value="low">Low Priority</option>
                            <option value="normal">Normal Priority</option>
                            <option value="high">High Priority</option>
                            <option value="critical">Critical Severity</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Evidence Document Links */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>Submitted Attachments</span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-border bg-background">
                          {active.files?.length || 0}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {active.files?.length > 0 ? (
                          active.files.map((f, i) => (
                            <li key={i}>
                              <a
                                href={`${SERVER_URL}${f.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between rounded-xl border border-border bg-card hover:bg-muted/40 px-3.5 py-3 text-xs transition group shadow-sm"
                              >
                                <div className="flex items-center gap-2 truncate pr-4">
                                  <FileText className="h-4 w-4 text-primary shrink-0" />
                                  <span className="truncate font-semibold text-foreground group-hover:text-primary transition-colors" title={f.originalName}>
                                    {f.originalName}
                                  </span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                              </a>
                            </li>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-xl bg-card">
                            <Paperclip className="h-5 w-5 text-muted-foreground/30 mb-1" />
                            <span className="text-[11px] text-muted-foreground italic font-medium">No attachments provided</span>
                          </div>
                        )}
                      </ul>
                    </div>

                    {/* Glowing Premium Student Feedback Card */}
                    {(active.satisfaction_feedback || active.satisfactionFeedback) && (
                      <div className="space-y-2.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Student Satisfaction
                        </div>
                        {/* soft emerald glow vs soft rose glow depending on feedback */}
                        {((active.satisfaction_feedback?.satisfied || active.satisfactionFeedback?.satisfied) === "yes") ? (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4.5 space-y-3 shadow-md shadow-emerald-500/[0.02]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                                Student Rating
                              </span>
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                                😄 Satisfied
                              </span>
                            </div>
                            {(active.satisfaction_feedback?.comments || active.satisfactionFeedback?.comments) && (
                              <p className="text-xs leading-relaxed italic text-emerald-300/90 bg-black/20 border border-emerald-500/10 rounded-lg p-3 select-all">
                                &ldquo;{active.satisfaction_feedback?.comments || active.satisfactionFeedback?.comments}&rdquo;
                              </p>
                            )}
                            <div className="text-[9.5px] text-muted-foreground/80 font-mono text-right">
                              Logged: {safeFormatDate(active.satisfaction_feedback?.submitted_at || active.satisfactionFeedback?.submitted_at, "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-4.5 space-y-3 shadow-md shadow-rose-500/[0.02]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                                Student Rating
                              </span>
                              <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                                😞 Unsatisfied
                              </span>
                            </div>
                            {(active.satisfaction_feedback?.comments || active.satisfactionFeedback?.comments) && (
                              <p className="text-xs leading-relaxed italic text-rose-300/90 bg-black/20 border border-rose-500/10 rounded-lg p-3 select-all">
                                &ldquo;{active.satisfaction_feedback?.comments || active.satisfactionFeedback?.comments}&rdquo;
                              </p>
                            )}
                            <div className="text-[9.5px] text-muted-foreground/80 font-mono text-right">
                              Logged: {safeFormatDate(active.satisfaction_feedback?.submitted_at || active.satisfactionFeedback?.submitted_at, "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* System Audit Details */}
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Database className="h-3.5 w-3.5 text-primary" /> Incident Parameters
                      </div>
                      
                      <div className="space-y-2 text-xs divide-y divide-border/60">
                        <div className="flex items-center justify-between py-2 text-foreground font-semibold">
                          <span className="text-muted-foreground font-medium">Department Unit</span>
                          <span className="truncate max-w-[140px]" title={formatCategory(active.category)}>
                            {formatCategory(active.category)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 text-foreground font-semibold">
                          <span className="text-muted-foreground font-medium">Privacy Status</span>
                          <span>{active.anonymous ? "Anonymous Submission" : "Public Submission"}</span>
                        </div>

                        {!active.anonymous && (
                          <>
                            <div className="flex items-center justify-between py-2 text-foreground font-semibold">
                              <span className="text-muted-foreground font-medium">Matric ID</span>
                              <span className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border">{active.submitter?.matric || "N/A"}</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2 text-foreground font-semibold">
                              <span className="text-muted-foreground font-medium">Contact Endpoint</span>
                              <span className="truncate max-w-[125px] font-mono text-[11px]" title={active.submitter?.email}>
                                {active.submitter?.email || "N/A"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="pt-2 border-t border-border/80 flex items-center gap-1.5 text-[10px] text-muted-foreground/90 font-medium">
                        <ShieldCheck className="h-4 w-4 text-success shrink-0" /> State updates are logged securely in ledger
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : detailLoading ? (
              <div className="flex flex-col items-center justify-center h-full rounded-2xl border border-border bg-card">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-3 text-sm font-semibold text-muted-foreground">Retrieving incident documents...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full rounded-2xl border border-border bg-card text-center p-6 bg-muted/5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/65 text-muted-foreground/30 mb-4 border border-border">
                  <ArrowRight className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="font-semibold text-foreground text-base">Platform Action Workspace</p>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-normal">
                  Select a student complaint incident from the sidebar ledger to initialize the resolving panel.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

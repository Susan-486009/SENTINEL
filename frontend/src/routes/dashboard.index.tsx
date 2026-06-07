import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, complaintService, type Complaint } from "@/lib/api";
import { motion, type Variants } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
};

function DashboardIndex() {
  const queryClient = useQueryClient();
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [skippedComplaints, setSkippedComplaints] = useState<string[]>([]);

  // 1. Fetch Auth State & User details
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me(),
  });

  // 2. Fetch Complaints submitted by user
  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: () => complaintService.getMine(),
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: ({ id, rating, comments }: { id: string; rating: number; comments: string }) =>
      complaintService.submitFeedback(id, { rating, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      toast.success("Thank you! Feedback submitted successfully.");
      setFeedbackRating(0);
      setFeedbackComments("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  if (userLoading || complaintsLoading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 py-20"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-10 w-10 animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading student dashboard data...
        </p>
      </div>
    );
  }

  // Calculate statistics
  const list = complaints || [];
  const stats = {
    total: list.length,
    pending: list.filter((c: Complaint) => c.status === "pending").length,
    inReview: list.filter((c: Complaint) => c.status === "in_review").length,
    resolved: list.filter((c: Complaint) => c.status === "resolved").length,
  };

  // Determine welcome greeting based on local time
  const hour = new Date().getHours();
  let greeting = "Welcome back";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-20"
    >
      {/* 1. Sleek Hero Greeting Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm"
      >
        <div className="absolute inset-0 opacity-[0.03] grid-bg" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border">
              LASUSTECH Resolution Hub
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, {user?.name || "Student"}.
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Report academic, facility, or administrative concerns safely. Your voice drives
              transparency and change across the institution.
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 text-xs font-mono text-muted-foreground self-start md:self-center">
            <span className="font-bold text-foreground">ACCOUNT IDENTITY</span>
            <span className="mt-1 flex items-center justify-between gap-4">
              ID: <span className="text-foreground font-semibold">{user?.matric || "N/A"}</span>
            </span>
            <span className="flex items-center justify-between gap-4">
              Role: <span className="text-foreground font-semibold capitalize">{user?.role}</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Premium Metric Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Submissions",
            value: stats.total,
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/15",
          },
          {
            label: "Pending Action",
            value: stats.pending,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/15",
          },
          {
            label: "In Investigation",
            value: stats.inReview,
            icon: AlertCircle,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/15",
          },
          {
            label: "Resolved Cases",
            value: stats.resolved,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/15",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="rounded-xl border border-border bg-card p-5 transition-all duration-150 shadow-sm hover:-translate-y-[1px] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Primary Content & Quick Actions Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Recent Complaints list */}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold tracking-tight">
              Recent Resolutions & Claims
            </h3>
            {list.length > 0 && (
              <Link
                to="/dashboard/reports"
                className="text-xs font-bold uppercase tracking-wider text-accent hover:underline flex items-center gap-1"
              >
                All Complaints <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/30 mb-5">
                  <FileText className="h-8 w-8" />
                </div>
                <h4 className="font-display text-lg font-bold text-foreground">
                  No complaints filed yet
                </h4>
                <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                  You haven't submitted any concerns yet. If you have an academic, IT, facility, or
                  staff complaint, file it today.
                </p>
                <Link
                  to="/submit"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition active:scale-[0.98] shadow-md shadow-primary/10"
                >
                  File a new complaint <Plus className="h-3.5 w-3.5 text-accent" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {list.slice(0, 5).map((complaint: Complaint) => {
                  let badgeBg = "text-amber-600 bg-amber-500/10 border-amber-500/20";
                  if (complaint.status === "in_review")
                    badgeBg = "text-indigo-600 bg-indigo-500/10 border-indigo-500/20";
                  if (complaint.status === "resolved" || complaint.status === "fixed")
                    badgeBg = "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
                  if (complaint.status === "rejected")
                    badgeBg = "text-rose-600 bg-rose-500/10 border-rose-500/20";

                  const refCode = complaint.reference_id || complaint.referenceId || "REF-UNKNOWN";

                  return (
                    <div
                      key={complaint._id}
                      className="group relative p-4 sm:px-6 hover:bg-muted/40 transition duration-150"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-accent select-all">
                              {refCode}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {complaint.category.replace("-", " ")}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition line-clamp-1">
                            {complaint.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-center">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}
                          >
                            {complaint.status.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                            {format(
                              new Date(complaint.created_at || complaint.createdAt || Date.now()),
                              "MMM dd, yyyy",
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Complaint progress bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-[2px] w-full rounded-full bg-border overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              complaint.status === "resolved" || complaint.status === "fixed"
                                ? "bg-emerald-500 w-full"
                                : complaint.status === "rejected"
                                  ? "bg-rose-500 w-full"
                                  : complaint.status === "in_review"
                                    ? "bg-indigo-500 w-2/3"
                                    : "bg-amber-500 w-1/3"
                            }`}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          {complaint.status === "resolved"
                            ? "Completed"
                            : complaint.status === "in_review"
                              ? "Investigating"
                              : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side: Quick Actions & Help Info */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
          <h3 className="font-display text-xl font-bold tracking-tight">Student Action Panel</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Quick Action 1: File Report */}
            <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" /> File a New Complaint
              </h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Submit a concern with files/evidence directly to reviewers.
              </p>
              <Link
                to="/submit"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
              >
                Launch Submission <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Quick Action 2: Track ID */}
            <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-500" /> Public Case Tracker
              </h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Track complaints directly by reference ID without logging in.
              </p>
              <Link
                to="/track"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
              >
                Open Case Tracker <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Quick Action 3: Settings */}
            <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-500" /> Manage Credentials
              </h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Update password, notification options, and theme controls.
              </p>
              <Link
                to="/dashboard/settings"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
              >
                Account Settings <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Security Advisory */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Resolve Security
                </h4>
                <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                  LASUSTECH implements strict data governance. Submissions are encrypted and
                  only viewable by authorized administrative staff.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Interactive Student Satisfaction Survey Popup Overlay Modal */}
      {(() => {
        const unratedComplaint = list.find(
          (c: any) =>
            (c.status === "resolved" || c.status === "fixed") &&
            !c.satisfaction_feedback?.submitted_at &&
            !c.satisfactionFeedback?.submitted_at &&
            !skippedComplaints.includes(c._id)
        );

        if (!unratedComplaint) return null;

        return (
          <Dialog open={!!unratedComplaint} onOpenChange={(open) => {
            if (!open) {
              setSkippedComplaints([...skippedComplaints, unratedComplaint._id]);
            }
          }}>
            <DialogContent className="sm:max-w-md select-none">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-600 font-display font-bold">
                  <CheckCircle2 className="h-5 w-5" /> Complaint Resolved
                </DialogTitle>
                <DialogDescription>
                  Your complaint reference <b>#{unratedComplaint.reference_id || unratedComplaint.referenceId}</b> has been resolved. Please rate your experience.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 text-xs space-y-1.5 shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" /> Admin Resolution Reply
                  </span>
                  <p className="text-foreground leading-relaxed italic pr-2 font-medium break-all break-words select-text">
                    &ldquo;{unratedComplaint.admin_feedback || unratedComplaint.adminFeedback || "No comments left."}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2.5 py-2">
                  <span className="text-xs text-muted-foreground font-semibold">Rate the resolution process</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= feedbackRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 cursor-pointer transition-colors duration-150 ${
                              isFilled ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">Additional feedback or suggestions</label>
                  <textarea
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Let us know how we can improve our services..."
                    className="w-full h-20 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none transition-all duration-300 text-foreground"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => {
                    setSkippedComplaints([...skippedComplaints, unratedComplaint._id]);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition active:scale-95"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (feedbackRating === 0) {
                      toast.error("Please select a star rating first.");
                      return;
                    }
                    submitFeedbackMutation.mutate({
                      id: unratedComplaint._id,
                      rating: feedbackRating,
                      comments: feedbackComments,
                    });
                  }}
                  disabled={submitFeedbackMutation.isPending || feedbackRating === 0}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98]"
                >
                  {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </motion.div>
  );
}

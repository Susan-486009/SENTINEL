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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authService, complaintService, type Complaint } from "@/lib/api";
import { motion, type Variants } from "framer-motion";
import { format } from "date-fns";

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
      {/* 1. Glassmorphic Hero Greeting Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-primary/10 via-background to-accent/5 p-6 md:p-8 shadow-soft"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent border border-accent/20 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>LASUSTECH Student Resolution Hub</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, <span className="text-accent">{user?.name || "Student"}</span>!
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Report academic, facility, or administrative concerns safely. Your voice drives
              transparency and change across LASUSTECH.
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-4 text-xs font-mono text-muted-foreground shadow-sm max-w-max self-start md:self-center border-l-4 border-l-accent">
            <span className="font-bold text-foreground">UNIVERSITY ACCOUNT IDENTITY</span>
            <span className="mt-1">
              Matric ID:{" "}
              <span className="text-foreground font-semibold">{user?.matric || "N/A"}</span>
            </span>
            <span>
              Role Type:{" "}
              <span className="text-foreground font-semibold capitalize">{user?.role}</span>
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
            whileHover={{ y: -4 }}
            className={`rounded-2xl border ${item.border} bg-card p-5 transition-all duration-300 shadow-soft hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
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
                All Reports <ChevronRight className="h-3 w-3" />
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
                  No reports filed yet
                </h4>
                <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                  You haven't submitted any concerns yet. If you have an academic, IT, facility, or
                  staff complaint, file it today.
                </p>
                <Link
                  to="/submit"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition active:scale-[0.98] shadow-md shadow-primary/10"
                >
                  File a new report <Plus className="h-3.5 w-3.5 text-accent" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {list.slice(0, 5).map((complaint: Complaint) => {
                  let badgeBg = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                  if (complaint.status === "in_review")
                    badgeBg = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
                  if (complaint.status === "resolved")
                    badgeBg = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                  if (complaint.status === "rejected")
                    badgeBg = "bg-rose-500/10 text-rose-600 border-rose-500/20";

                  const refCode = complaint.reference_id || complaint.referenceId || "REF-UNKNOWN";

                  return (
                    <div
                      key={complaint._id}
                      className="group relative p-5 hover:bg-muted/30 transition duration-300"
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
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              complaint.status === "resolved"
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
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden group shadow-soft"
            >
              <div className="absolute right-0 top-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-accent/5 transition-transform group-hover:scale-125" />
              <h4 className="font-semibold text-sm text-foreground">File a New Report</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Submit a concern with files/evidence directly to reviewers.
              </p>
              <Link
                to="/submit"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
              >
                Launch Submission{" "}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Quick Action 2: Track ID */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden group shadow-soft"
            >
              <div className="absolute right-0 top-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-blue-500/5 transition-transform group-hover:scale-125" />
              <h4 className="font-semibold text-sm text-foreground">Public Case Tracker</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Track complaints directly by reference ID without logging in.
              </p>
              <Link
                to="/track"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
              >
                Open Case Tracker{" "}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Quick Action 3: Settings */}
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden group shadow-soft"
            >
              <div className="absolute right-0 top-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-indigo-500/5 transition-transform group-hover:scale-125" />
              <h4 className="font-semibold text-sm text-foreground">Manage Credentials</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Update password, notification options, and theme controls.
              </p>
              <Link
                to="/dashboard/settings"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:underline"
              >
                Account Settings{" "}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Security Advisory */}
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 border-l-4 border-l-accent shadow-soft">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Sentinel Security Boundary
                </h4>
                <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                  LASUSTECH implements cryptographic correlation hashing on complaints. Stored
                  uploads are automatically compressed and sanitized to preserve student
                  confidentiality.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

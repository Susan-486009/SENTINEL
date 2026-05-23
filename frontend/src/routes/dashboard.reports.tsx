import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Plus, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/lib/api";
import { format } from "date-fns";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const {
    data: complaints = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: () => complaintService.getMine(),
  });

  const filteredComplaints =
    filterStatus === "all" ? complaints : complaints.filter((c) => c.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <h3 className="mt-3 font-semibold text-destructive">Failed to load reports</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 sm:py-24 text-center">
        <div className="flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
          <FileText className="h-8 sm:h-10 w-8 sm:w-10" />
        </div>
        <h2 className="mt-6 font-display text-xl sm:text-2xl font-semibold">No reports yet</h2>
        <p className="mt-2 max-w-sm text-sm sm:text-base text-muted-foreground">
          When you submit a concern or report, it will appear here for you to track and manage.
        </p>
        <Link
          to="/submit"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-primary-foreground hover:opacity-90 transition active:scale-[0.98]"
        >
          Submit your first report <Plus className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
        </Link>

        <div className="mt-12 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 max-w-lg w-full px-4 sm:px-0">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-left">
            <h3 className="text-sm font-semibold">Need help?</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Check our FAQ for common questions about reporting.
            </p>
            <Link
              to="/"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              View FAQ <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-left">
            <h3 className="text-sm font-semibold">Track case</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Have a reference ID? Track your case without signing in.
            </p>
            <Link
              to="/track"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              Track now <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statuses = [
    { value: "all", label: "All Reports", count: complaints.length },
    {
      value: "pending",
      label: "Pending",
      count: complaints.filter((c) => c.status === "pending").length,
    },
    {
      value: "in_review",
      label: "In Review",
      count: complaints.filter((c) => c.status === "in_review").length,
    },
    {
      value: "resolved",
      label: "Resolved",
      count: complaints.filter((c) => c.status === "resolved").length,
    },
    {
      value: "rejected",
      label: "Rejected",
      count: complaints.filter((c) => c.status === "rejected").length,
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Your Reports</h1>

        {/* Filter pills - responsive scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                filterStatus === status.value
                  ? "bg-accent text-primary-foreground"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {status.label}{" "}
              <span className="ml-1 inline text-[10px] font-bold">({status.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reports list - responsive grid */}
      <div className="grid gap-3 sm:gap-4">
        {filteredComplaints.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 sm:p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              No {filterStatus !== "all" ? filterStatus : ""} reports
            </p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => {
            let statusBg = "bg-amber-500/10 text-amber-600 border-amber-500/20";
            if (complaint.status === "in_review")
              statusBg = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
            if (complaint.status === "resolved")
              statusBg = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            if (complaint.status === "rejected")
              statusBg = "bg-rose-500/10 text-rose-600 border-rose-500/20";

            const refCode = complaint.reference_id || complaint.referenceId || "REF-UNKNOWN";

            return (
              <Link
                key={complaint._id}
                to={`/dashboard/reports/${complaint._id}`}
                className="block group rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-accent/50 hover:bg-muted/50 transition"
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">{refCode}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {complaint.category.replace("-", " ")}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base group-hover:text-accent transition line-clamp-2">
                        {complaint.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusBg}`}
                      >
                        {complaint.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{complaint.priority?.toUpperCase() || "NORMAL"} PRIORITY</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      {format(
                        new Date(complaint.created_at || complaint.createdAt || Date.now()),
                        "MMM dd, yyyy",
                      )}
                    </span>
                  </div>

                  {/* Progress bar */}
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
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

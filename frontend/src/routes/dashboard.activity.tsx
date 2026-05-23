import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { complaintService, type Complaint } from "@/lib/api";
import { History, Loader2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const {
    data: complaints = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: () => complaintService.getMine(),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <h3 className="mt-3 font-semibold text-destructive">Failed to load activity</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    );
  }

  // Build activity timeline from all complaints
  const activities: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
    complaint: Complaint;
    icon: any;
  }> = [];

  complaints.forEach((complaint) => {
    activities.push({
      type: "created",
      title: "Report submitted",
      description: `"${complaint.title}" (${complaint.category})`,
      timestamp: complaint.created_at || complaint.createdAt || "",
      complaint,
      icon: History,
    });

    if (complaint.timeline && Array.isArray(complaint.timeline)) {
      complaint.timeline.forEach((entry) => {
        activities.push({
          type: entry.type,
          title: entry.text || `${entry.type.replace(/_/g, " ").toUpperCase()}`,
          description: entry.user_id?.name || "System",
          timestamp: entry.created_at || "",
          complaint,
          icon: History,
        });
      });
    }
  });

  // Sort by timestamp descending
  const sortedActivities = activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (sortedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 sm:py-24 text-center">
        <div className="flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
          <History className="h-8 sm:h-10 w-8 sm:w-10" />
        </div>
        <h2 className="mt-6 font-display text-xl sm:text-2xl font-semibold">No activity yet</h2>
        <p className="mt-2 max-w-sm text-sm sm:text-base text-muted-foreground">
          Your account activity and complaint timeline updates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          Timeline of your report submissions and status updates
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {sortedActivities.map((activity, index) => {
          const typeColors: Record<string, string> = {
            created: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            status_change: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            note_added: "bg-amber-500/10 text-amber-600 border-amber-500/20",
            assigned: "bg-purple-500/10 text-purple-600 border-purple-500/20",
            evidence_added: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            system: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          };

          return (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 hover:bg-muted/50 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Timeline dot and line */}
                <div className="flex sm:flex-col items-start gap-0">
                  <div
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0 ${
                      typeColors[activity.type] || typeColors["system"]
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  {index < sortedActivities.length - 1 && (
                    <div className="ml-[15px] sm:ml-0 sm:mt-2 w-0.5 h-12 sm:h-8 bg-border/30" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground">
                        {activity.title}
                      </h3>
                      <p className="text-xs mt-1 text-muted-foreground">{activity.description}</p>
                      {activity.complaint && (
                        <p className="text-xs mt-2 font-mono text-accent">
                          {activity.complaint.reference_id ||
                            activity.complaint.referenceId ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

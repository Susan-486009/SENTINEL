import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, FileText, History, Bell, Settings, Plus, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { complaintService, type User } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LASUSTECH Resolution Center" }] }),
  component: StudentDashboard,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/reports", label: "My reports", icon: FileText },
  { to: "/dashboard/activity", label: "Activity", icon: History },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function StudentDashboard() {
  const user: User | null = JSON.parse(localStorage.getItem("user") || "null");

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: () => complaintService.getMine(),
  });

  const { data: notifications, isLoading: notesLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getMine(),
    enabled: !!user,
  });

  const isLoading = reportsLoading || notesLoading;

  const stats = [
    { 
      label: "Active reports", 
      value: reports?.filter(r => r.status === 'pending' || r.status === 'in_review').length || 0, 
      icon: AlertCircle, 
      tint: "text-warning", 
      bg: "bg-warning/10" 
    },
    { 
      label: "In review", 
      value: reports?.filter(r => r.status === 'in_review').length || 0, 
      icon: Clock, 
      tint: "text-accent", 
      bg: "bg-accent/10" 
    },
    { 
      label: "Resolved", 
      value: reports?.filter(r => r.status === 'resolved').length || 0, 
      icon: CheckCircle2, 
      tint: "text-success", 
      bg: "bg-success/10" 
    },
  ];

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_review': return 'accent';
      case 'resolved': return 'success';
      case 'rejected': return 'danger';
      default: return 'muted';
    }
  };

  return (
    <AppShell nav={nav} primaryAction={{ to: "/submit", label: "Submit new report" }} title="Dashboard">
      {/* ... greeting ... */}

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} ${s.tint}`}>
                <s.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold tracking-tight">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin opacity-20" /> : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Reports */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card min-h-[400px]">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-display text-base font-semibold">Recent reports</h3>
            <Link to="/dashboard/reports" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          
          {reportsLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Fetching your cases...</p>
            </div>
          ) : reports && reports.length > 0 ? (
            <ul className="divide-y divide-border">
              {reports.slice(0, 5).map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-muted/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={getStatusTone(r.status)}>{r.status.replace('_', ' ').toUpperCase()}</StatusBadge>
                      <span className="text-xs text-muted-foreground">#{r.reference_id}</span>
                    </div>
                    <div className="mt-1.5 truncate font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.category} · Updated {formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Link to="/track" className="hidden text-sm font-medium text-accent hover:underline sm:inline">View</Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No reports found yet.</p>
              <Link to="/submit" className="text-sm font-medium text-accent hover:underline">Submit your first report</Link>
            </div>
          )}
        </div>

        {/* System updates (Notifications) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-display text-base font-semibold">Activity & Updates</h3>
          </div>
          <ul className="space-y-5 p-6">
            {notifications && notifications.length > 0 ? notifications.slice(0, 5).map((n: any) => (
              <li key={n._id} className="flex gap-3">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-muted" : "bg-accent"}`} />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{n.title}</span>{" "}
                    <span className="text-muted-foreground block text-xs mt-0.5">{n.message}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </li>
            )) : (
              <li className="text-sm text-muted-foreground italic text-center py-10">
                No recent activity.
              </li>
            )}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
    </AppShell>
  );
}

export function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const map: Record<string, string> = {
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[tone] || map.muted}`}>{children}</span>
  );
}

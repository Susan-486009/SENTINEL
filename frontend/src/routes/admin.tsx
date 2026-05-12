import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, Building2, BarChart3, FileText, ScrollText, Settings, ArrowUpRight, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { adminNav, StatusBadge } from "@/lib/ui-shared";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin overview — LASUSTECH Resolution Center" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: allComplaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ["all-complaints"],
    queryFn: () => complaintService.getAll(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => complaintService.getStats(),
  });

  const isLoading = complaintsLoading || statsLoading;

  const metrics = [
    { 
      label: "Open cases", 
      value: (stats?.statusCounts?.pending || 0) + (stats?.statusCounts?.in_review || 0), 
      change: "+12%", 
      trend: "up", 
      icon: AlertTriangle, 
      tint: "text-warning", 
      bg: "bg-warning/10" 
    },
    { 
      label: "In Review", 
      value: stats?.statusCounts?.in_review || 0, 
      change: "-18%", 
      trend: "down", 
      icon: Clock, 
      tint: "text-accent", 
      bg: "bg-accent/10" 
    },
    { 
      label: "Resolved", 
      value: stats?.statusCounts?.resolved || 0, 
      change: "+8%", 
      trend: "up", 
      icon: CheckCircle2, 
      tint: "text-success", 
      bg: "bg-success/10" 
    },
    { 
      label: "Rejected", 
      value: stats?.statusCounts?.rejected || 0, 
      change: "+2", 
      trend: "up", 
      icon: TrendingUp, 
      tint: "text-destructive", 
      bg: "bg-destructive/10" 
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
    <AppShell nav={adminNav} title="Overview">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Operations overview</h2>
          <p className="mt-1 text-muted-foreground">Live snapshot of cases across all departments.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
          {["7 days", "30 days", "90 days"].map((r, i) => (
            <button key={r} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{m.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg} ${m.tint}`}>
                <m.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-display text-3xl font-semibold tracking-tight">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin opacity-20" /> : m.value}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${m.trend === "up" ? "text-success" : "text-destructive"}`}>
                {m.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Trends chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Complaint trends</h3>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          <FakeChart />
        </div>

        {/* Departments */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-display text-base font-semibold">Department activity</h3>
          </div>
          <ul className="space-y-4 p-6">
            {stats?.categoryStats?.length > 0 ? stats.categoryStats.map((d: any) => {
              const total = d.open + d.resolved;
              const pct = total > 0 ? (d.resolved / total) * 100 : 0;
              return (
                <li key={d._id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d._id}</span>
                    <span className="text-muted-foreground">{d.open} open</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            }) : (
              <li className="text-sm text-muted-foreground italic">No category data available</li>
            )}
          </ul>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="mt-8 rounded-2xl border border-border bg-card min-h-[300px]">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-base font-semibold">Recent submissions</h3>
          <Link className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline" to="/admin/cases">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading submissions...</p>
          </div>
        ) : allComplaints && allComplaints.length > 0 ? (
          <>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Case</th>
                    <th className="px-6 py-3 font-medium">Submitted by</th>
                    <th className="px-6 py-3 font-medium">Department</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {allComplaints.slice(0, 10).map((r) => (
                    <tr key={r._id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">#{r.reference_id}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{r.anonymous ? "Anonymous" : "User"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.category}</td>
                      <td className="px-6 py-4"><StatusBadge tone={getStatusTone(r.status)}>{r.status.replace('_', ' ').toUpperCase()}</StatusBadge></td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <ul className="divide-y divide-border md:hidden">
              {allComplaints.slice(0, 10).map((r) => (
                <li key={r._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <StatusBadge tone={getStatusTone(r.status)}>{r.status.replace('_', ' ').toUpperCase()}</StatusBadge>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}</span>
                  </div>
                  <div className="mt-1.5 font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">#{r.reference_id} · {r.category}</div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FakeChart() {
  const points = [12, 18, 15, 22, 28, 24, 30, 26, 34, 32, 40, 38, 44, 42, 48];
  const max = Math.max(...points);
  const w = 600;
  const h = 180;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <div className="mt-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.50 0.21 264)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.50 0.21 264)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#g)" />
        <path d={path} fill="none" stroke="oklch(0.50 0.21 264)" strokeWidth="2" />
      </svg>
      <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
        <span>Apr 1</span><span>Apr 8</span><span>Apr 15</span><span>Apr 22</span><span>Apr 30</span>
      </div>
    </div>
  );
}

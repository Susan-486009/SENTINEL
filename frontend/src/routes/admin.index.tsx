import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/lib/api";
import { AnalyticCard } from "@/components/AnalyticCard";
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { formatCategory, StatusBadge } from "@/lib/ui-shared";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — Admin Dashboard" }] }),
  component: AdminDashboardOverview,
});

const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
};

function AdminDashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => complaintService.getStats(),
  });

  const { data: recentCases, isLoading: casesLoading } = useQuery({
    queryKey: ["recent-complaints"],
    queryFn: () => complaintService.getAll({ limit: 5 }),
  });

  const statusCounts = stats?.statusCounts || {};
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const resolved = (statusCounts.resolved || 0) + (statusCounts.fixed || 0);
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const activeIssues = (statusCounts.pending || 0) + (statusCounts.in_review || 0);

  // Fallback / mock volume data for trends chart
  const volumeData = [
    { day: "Mon", cases: 4 },
    { day: "Tue", cases: 7 },
    { day: "Wed", cases: 5 },
    { day: "Thu", cases: 9 },
    { day: "Fri", cases: 12 },
    { day: "Sat", cases: 3 },
    { day: "Sun", cases: 2 },
  ];

  const categoryData = (stats?.categoryStats || [])
    .map((cat) => ({
      name: formatCategory(cat._id),
      total: cat.open + cat.resolved,
      resolved: cat.resolved,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

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

  const isLoading = statsLoading || casesLoading;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Overview Dashboard</h2>
          <p className="text-muted-foreground">Real-time resolution metrics and student complaints intelligence.</p>
        </div>
        <Link
          to="/admin/cases"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition shadow-sm"
        >
          View Case Registry <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Metrics Overview Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticCard
              label="Total Complaints"
              value={total.toLocaleString()}
              icon={Inbox}
              description="Total filed cases"
              trend={{ value: 14, isPositive: true }}
            />
            <AnalyticCard
              label="Resolution Rate"
              value={`${resolutionRate}%`}
              icon={CheckCircle2}
              description="Closed & resolved cases"
              trend={{ value: 4, isPositive: true }}
            />
            <AnalyticCard
              label="Avg. Response"
              value="3.5h"
              icon={Clock}
              description="Average initial response"
              trend={{ value: 12, isPositive: false }}
            />
            <AnalyticCard
              label="Active Operations"
              value={activeIssues.toLocaleString()}
              icon={AlertCircle}
              description="Awaiting action/review"
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Volume Trend */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Submissions Volume</h3>
                  <p className="text-xs text-muted-foreground">Cases registered over the last week</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <TrendingUp className="h-3.5 w-3.5" /> +14% from last week
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} opacity={0.5} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.muted }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.muted }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid " + COLORS.border, background: "hsl(var(--card))" }} />
                    <Area type="monotone" dataKey="cases" stroke={COLORS.accent} strokeWidth={2.5} fillOpacity={1} fill="url(#colorCases)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Categories */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground">Top Complaint Departments</h3>
                <p className="text-xs text-muted-foreground">Highest volume resolution units</p>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.border} opacity={0.5} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: COLORS.muted }} width={120} />
                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "12px", border: "1px solid " + COLORS.border, background: "hsl(var(--card))" }} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={16}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.accent : COLORS.primary} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Submissions Registry */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Recent Submissions</h3>
                <p className="text-xs text-muted-foreground">Latest complaints requiring review or dispatching</p>
              </div>
              <Link
                to="/admin/cases"
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
              >
                Go to case registry <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="bg-muted/30 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 border-b border-border">Reference ID</th>
                    <th className="px-4 py-3 border-b border-border">Title</th>
                    <th className="px-4 py-3 border-b border-border">Category</th>
                    <th className="px-4 py-3 border-b border-border">Status</th>
                    <th className="px-4 py-3 border-b border-border">Urgency</th>
                    <th className="px-4 py-3 border-b border-border">Date Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentCases && recentCases.length > 0 ? (
                    recentCases.slice(0, 5).map((c: any) => (
                      <tr key={c._id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-semibold text-accent">
                          <Link to="/admin/cases" className="hover:underline">
                            #{c.reference_id || c.referenceId}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 font-medium max-w-[200px] truncate" title={c.title}>
                          {c.title}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex px-2 py-0.5 rounded border border-border bg-slate-950/20 text-[10px]">
                            {formatCategory(c.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge tone={getStatusTone(c.status)}>
                            {c.status.toUpperCase().replace("_", " ")}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3.5 font-semibold capitalize">
                          <span
                            className={
                              c.priority === "critical"
                                ? "text-red-500"
                                : c.priority === "high"
                                  ? "text-amber-500"
                                  : "text-muted-foreground"
                            }
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {formatDistanceToNow(new Date(c.created_at || c.createdAt), { addSuffix: true })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground italic">
                        No recent complaints found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

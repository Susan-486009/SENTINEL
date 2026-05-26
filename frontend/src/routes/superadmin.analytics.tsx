import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertCircle, Inbox } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/lib/api";
import { AnalyticCard } from "@/components/AnalyticCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export const Route = createFileRoute("/superadmin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AnalyticsPage,
});

// Minimalist theme colors
const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
};

function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => complaintService.getStats(),
  });

  const statusCounts = stats?.statusCounts || {};
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const resolved = statusCounts.resolved || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Mock data for volume trend (simulating last 7 days)
  const volumeData = [
    { day: "Mon", cases: 12 },
    { day: "Tue", cases: 19 },
    { day: "Wed", cases: 15 },
    { day: "Thu", cases: 22 },
    { day: "Fri", cases: 30 },
    { day: "Sat", cases: 10 },
    { day: "Sun", cases: 8 },
  ];

  const categoryData = (stats?.categoryStats || [])
    .map((cat) => ({
      name: cat._id
        ? cat._id
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "Other",
      total: cat.open + cat.resolved,
      resolved: cat.resolved,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 pb-10">
        {/* Metric Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticCard
            label="Total Cases"
            value={total.toLocaleString()}
            icon={Inbox}
            description="Lifetime submissions"
            trend={{ value: 12, isPositive: true }}
          />
          <AnalyticCard
            label="Resolution Rate"
            value={`${resolutionRate}%`}
            icon={CheckCircle2}
            description="Cases successfully closed"
            trend={{ value: 5, isPositive: true }}
          />
          <AnalyticCard
            label="Avg. Response"
            value="4.2h"
            icon={Clock}
            description="Time to first review"
            trend={{ value: 8, isPositive: false }}
          />
          <AnalyticCard
            label="Active Issues"
            value={(statusCounts.pending || 0) + (statusCounts.in_review || 0)}
            icon={AlertCircle}
            description="Awaiting action"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Volume Trend Chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Submission Volume</h3>
                <p className="text-xs text-muted-foreground">Cases reported over the last 7 days</p>
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
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={COLORS.border}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: COLORS.muted }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: COLORS.muted }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid " + COLORS.border,
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cases"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCases)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground">Top Categories</h3>
              <p className="text-xs text-muted-foreground">Highest volume departments</p>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={COLORS.border}
                    opacity={0.5}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: COLORS.muted }}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid " + COLORS.border }}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? COLORS.accent : COLORS.primary}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { complaintService, adminService, type Complaint } from "@/lib/api";
import { Shield, Users, Inbox, Activity } from "lucide-react";

export const Route = createFileRoute("/superadmin/")({
  component: SuperadminDashboard,
});

function SuperadminDashboard() {
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    // In a real app we would have a dedicated endpoint for these high level metrics
    // For now we just mock some command center data or fetch basic stats
    complaintService.getAdminStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">System Command Center</h1>
        <p className="text-muted-foreground">Global overview of the Sentinel platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            <h2 className="text-2xl font-bold">1,248</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
            <h2 className="text-2xl font-bold">
              {(stats?.statusCounts?.pending || 0) + (stats?.statusCounts?.in_review || 0)}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">System Health</p>
            <h2 className="text-2xl font-bold text-success">100%</h2>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Security Flags</p>
            <h2 className="text-2xl font-bold">3</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border p-4 hover:bg-accent/5 hover:border-accent/40 transition-colors">
              <Users className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Create Admin</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border p-4 hover:bg-accent/5 hover:border-accent/40 transition-colors">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Review Audit Log</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Recent System Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-success"></div>
              <p className="text-sm">Database backup completed successfully.</p>
              <span className="ml-auto text-xs text-muted-foreground">2m ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-warning"></div>
              <p className="text-sm">New admin account created (Dean Office).</p>
              <span className="ml-auto text-xs text-muted-foreground">1h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

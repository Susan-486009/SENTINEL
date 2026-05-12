import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, FileText, History, Bell, Settings } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/reports", label: "My reports", icon: FileText },
  { to: "/dashboard/activity", label: "Activity", icon: History },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function DashboardLayout() {
  return (
    <AppShell nav={nav} primaryAction={{ to: "/submit", label: "Submit new report" }} title="Dashboard">
      <Outlet />
    </AppShell>
  );
}

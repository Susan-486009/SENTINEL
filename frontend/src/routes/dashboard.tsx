import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { LayoutDashboard, FileText, History, Bell, Settings } from "lucide-react";
import { AppShell } from "@/components/AppShell";

import { User } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("as_access_token");
      const userStr = localStorage.getItem("user");
      
      if (!token) {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }

      let user: User | null = null;
      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {}

      if (user) {
        if (user.role === "superadmin") throw redirect({ to: "/superadmin" });
        if (user.role === "admin") throw redirect({ to: "/admin" });
        if (user.role === "staff") throw redirect({ to: "/staff" });
      }
    }
  },
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
    <AppShell
      nav={nav}
      primaryAction={{ to: "/submit", label: "Submit new report" }}
      title="Dashboard"
    >
      <Outlet />
    </AppShell>
  );
}

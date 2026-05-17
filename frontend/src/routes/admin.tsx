import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { User } from "@/lib/api";
import { adminNav } from "@/lib/ui-shared";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("as_access_token");
      const userStr = localStorage.getItem("user");
      let user: User | null = null;
      
      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {}

      if (!token || user?.role !== 'admin') {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppShell nav={adminNav} title="Admin Portal">
      <Outlet />
    </AppShell>
  );
}

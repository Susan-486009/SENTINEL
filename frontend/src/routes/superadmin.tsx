import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SuperadminShell } from "@/components/SuperadminShell";
import { User } from "@/lib/api";
import { superadminNav } from "@/lib/ui-shared";

export const Route = createFileRoute("/superadmin")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("as_access_token");
      const userStr = localStorage.getItem("user");
      let user: User | null = null;

      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {}

      if (!token || user?.role !== "superadmin") {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  component: SuperadminLayout,
});

function SuperadminLayout() {
  return (
    <SuperadminShell nav={superadminNav} title="Command Center">
      <Outlet />
    </SuperadminShell>
  );
}

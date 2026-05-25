import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { StaffShell } from "@/components/StaffShell";
import { User } from "@/lib/api";
import { staffNav } from "@/lib/ui-shared";

export const Route = createFileRoute("/staff")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("as_access_token");
      const userStr = localStorage.getItem("user");
      let user: User | null = null;

      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {}

      if (!token || user?.role !== "staff") {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  component: StaffLayout,
});

function StaffLayout() {
  return (
    <StaffShell nav={staffNav} title="Department Board">
      <Outlet />
    </StaffShell>
  );
}

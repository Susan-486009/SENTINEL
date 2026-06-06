import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/cases")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/reports", replace: true });
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { adminNav } from "@/lib/ui-shared";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <AppShell nav={adminNav} title="Analytics">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
          <BarChart3 className="h-10 w-10" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">Deep Analytics</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Track resolution times, satisfaction rates, and volume trends across the university.
        </p>
        <div className="mt-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-success" /> Coming soon in v1.1
        </div>
      </div>
    </AppShell>
  );
}

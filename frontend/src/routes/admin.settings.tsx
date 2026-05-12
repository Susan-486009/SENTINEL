import { createFileRoute } from "@tanstack/react-router";
import { Settings, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { adminNav } from "@/lib/ui-shared";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <AppShell nav={adminNav} title="Settings">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
          <Settings className="h-10 w-10" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">Platform Settings</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Manage institutional configurations, security policies, and administrator access levels.
        </p>
        <div className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground">
          <Lock className="h-4 w-4" /> Restricted to Super Administrators
        </div>
      </div>
    </AppShell>
  );
}

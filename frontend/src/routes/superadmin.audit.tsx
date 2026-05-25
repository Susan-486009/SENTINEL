import { createFileRoute } from "@tanstack/react-router";
import { ScrollText, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/superadmin/audit")({
  head: () => ({ meta: [{ title: "Audit logs — Admin" }] }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
          <ScrollText className="h-10 w-10" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">Security Audit</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          View a complete history of all administrative actions, logins, and configuration changes.
        </p>
        <div className="mt-8 flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          <ShieldCheck className="h-4 w-4" /> System logging is currently active
        </div>
      </div>
    </div>
  );
}

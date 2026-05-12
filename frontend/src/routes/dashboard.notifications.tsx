import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/notifications")({
  component: () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
        <Bell className="h-10 w-10" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold">All caught up</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        You have no unread notifications. We'll alert you here when your case status changes.
      </p>
      
      <div className="mt-12 flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-4 py-2 text-xs font-medium text-success">
        <CheckCircle2 className="h-3.5 w-3.5" /> Notifications are synchronized
      </div>
    </div>
  ),
});

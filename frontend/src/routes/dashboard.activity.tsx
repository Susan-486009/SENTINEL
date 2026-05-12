import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";

export const Route = createFileRoute("/dashboard/activity")({
  component: () => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <History className="h-12 w-12 text-muted-foreground/20" />
      <h2 className="text-xl font-semibold">Activity log</h2>
      <p className="text-muted-foreground">Detailed history of your account actions.</p>
    </div>
  ),
});

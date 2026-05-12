import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/reports")({
  component: () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
        <FileText className="h-10 w-10" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold">No reports yet</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        When you submit a concern or report, it will appear here for you to track and manage.
      </p>
      <Link 
        to="/submit" 
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition active:scale-[0.98]"
      >
        Submit your first report <Plus className="h-4 w-4" />
      </Link>
      
      <div className="mt-12 grid gap-4 sm:grid-cols-2 max-w-lg w-full">
        <div className="rounded-2xl border border-border bg-card p-5 text-left">
          <h3 className="text-sm font-semibold">Need help?</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">Check our FAQ for common questions about reporting.</p>
          <Link to="/" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
            View FAQ <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-left">
          <h3 className="text-sm font-semibold">Track case</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">Have a reference ID? Track your case without signing in.</p>
          <Link to="/track" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
            Track now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  ),
});

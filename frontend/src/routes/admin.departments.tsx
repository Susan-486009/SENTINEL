import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { adminNav } from "@/lib/ui-shared";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({ meta: [{ title: "Departments — Admin" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  return (
    <AppShell nav={adminNav} title="Departments">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/30">
          <Building2 className="h-10 w-10" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">Department Management</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Configure resolution departments, assign leads, and manage triage routing rules.
        </p>
        <button
          onClick={() => import("sonner").then(m => m.toast.info("Department configuration coming in v2"))}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition active:scale-[0.98]"
        >
          Add Department <Plus className="h-4 w-4" />
        </button>
      </div>
    </AppShell>
  );
}

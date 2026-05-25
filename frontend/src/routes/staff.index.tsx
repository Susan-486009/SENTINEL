import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { complaintService, type Complaint } from "@/lib/api";
import { toast } from "sonner";
import { formatCategory, StatusBadge } from "@/lib/ui-shared";

export const Route = createFileRoute("/staff/")({
  component: StaffBoard,
});

function StaffBoard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getAll();
      setComplaints(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await complaintService.updateStatus(id, newStatus, "");
      toast.success(`Case moved to ${newStatus}`);
      fetchCases();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  // Group by status
  const pending = complaints.filter((c) => c.status === "pending");
  const inReview = complaints.filter((c) => c.status === "in_review");
  const resolved = complaints.filter((c) => c.status === "resolved");

  const BoardColumn = ({ title, items, color, nextStatus }: { title: string, items: Complaint[], color: string, nextStatus: string | null }) => (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold ${color}`}>{title}</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-medium border border-border">
          {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">No cases.</p>
        ) : (
          items.map((c) => (
            <div key={c._id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-hover hover:border-accent/40">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.reference_id}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-medium text-sm leading-snug">{c.title}</h4>
              
              <div className="mt-2 flex items-center justify-between">
                <StatusBadge tone="muted">{formatCategory(c.category)}</StatusBadge>
                {nextStatus && (
                  <button 
                    onClick={() => updateStatus(c._id, nextStatus)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Move to {nextStatus.replace('_', ' ')} &rarr;
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading your department's cases...</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Department Action Board</h1>
        <button onClick={fetchCases} className="text-sm font-medium text-accent hover:underline">
          Refresh Board
        </button>
      </div>
      
      <p className="text-muted-foreground">
        Drag and drop is coming soon. For now, click 'Move' to advance a case. You only see cases assigned to your department.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <BoardColumn title="To Do (Pending)" items={pending} color="text-warning" nextStatus="in_review" />
        <BoardColumn title="In Progress (Reviewing)" items={inReview} color="text-accent" nextStatus="resolved" />
        <BoardColumn title="Done (Resolved)" items={resolved} color="text-success" nextStatus={null} />
      </div>
    </div>
  );
}

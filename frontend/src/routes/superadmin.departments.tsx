import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Edit2, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService, authService } from "@/lib/api";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/superadmin/departments")({
  head: () => ({ meta: [{ title: "Departments — Superadmin" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head_id: "",
  });

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
  });

  const { data: adminsData } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => authService.getUsers({ role: "admin" }),
  });
  
  const admins = adminsData?.users || [];

  const addMutation = useMutation({
    mutationFn: (data: any) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created successfully.");
      setIsAddOpen(false);
      setFormData({ name: "", description: "", head_id: "" });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create department"),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully.");
      setIsEditOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update department"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deactivated successfully.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete department"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      head_id: formData.head_id === "" ? undefined : formData.head_id,
    };
    if (isEditOpen && selectedDept) {
      editMutation.mutate({ id: selectedDept._id, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const openEdit = (dept: any) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || "",
      head_id: dept.head_id?._id || "",
    });
    setIsEditOpen(true);
  };

  // We ensure data returned from API matches the format array. If it's wrapped in { data: [] }, extract it.
  const deptList = Array.isArray(departments) ? departments : (departments as any)?.data || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Department Management</h2>
          <p className="text-muted-foreground">Configure resolution departments and assign leads.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => setFormData({ name: "", description: "", head_id: "" })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Add Department
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="head_id">Department Head (Admin)</Label>
                  <select
                    id="head_id"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.head_id}
                    onChange={(e) => setFormData({ ...formData, head_id: e.target.value })}
                  >
                    <option value="">-- Select an Admin --</option>
                    {admins.map((admin: any) => (
                      <option key={admin.id || admin._id} value={admin.id || admin._id}>
                        {admin.name} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  {addMutation.isPending ? "Saving..." : "Save Department"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Department Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Department Head</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </td>
                </tr>
              ) : deptList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <Building2 className="mx-auto h-8 w-8 opacity-20 mb-3" />
                    No departments found.
                  </td>
                </tr>
              ) : (
                deptList.map((dept: any) => (
                  <tr key={dept._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{dept.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {dept.description || <span className="italic opacity-50">No description</span>}
                    </td>
                    <td className="px-4 py-3">
                      {dept.head_id ? (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span>{dept.head_id.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(dept)}
                          className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this department?")) {
                              deleteMutation.mutate(dept._id);
                            }
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-head">Department Head</Label>
                <select
                  id="edit-head"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.head_id}
                  onChange={(e) => setFormData({ ...formData, head_id: e.target.value })}
                >
                  <option value="">-- Unassigned --</option>
                  {admins.map((admin: any) => (
                    <option key={admin.id || admin._id} value={admin.id || admin._id}>
                      {admin.name} ({admin.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <button
                type="submit"
                disabled={editMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

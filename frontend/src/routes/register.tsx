import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { authService } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — LASUSTECH Resolution Center" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [role, setRole] = useState<"student" | "staff">("student");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    matric_number: "",
    staff_id: "",
  });
  
  const nav = useNavigate();

  const update = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role,
        matric: role === "student" ? formData.matric_number : formData.staff_id,
      };
      
      const data = await authService.register(payload);
      localStorage.setItem("as_access_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Account created successfully!");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Verify your university information to get started."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-5" autoComplete="off">
        <div>
          <span className="block text-sm font-medium">I am a</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {([
              { v: "student", label: "Student", icon: GraduationCap },
              { v: "staff", label: "Staff", icon: Briefcase },
            ] as const).map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setRole(v)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  role === v ? "border-accent bg-accent/5 ring-2 ring-accent/15" : "border-border hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    {v === "student" ? "Undergraduate or postgraduate" : "Faculty or administration"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        
        <Field 
          label="Full name" 
          placeholder="Enter your full name" 
          leading={<User className="h-4 w-4" />} 
          value={formData.full_name}
          onChange={(e) => update("full_name", e.target.value)}
          required 
          autoComplete="off"
        />
        
        <Field 
          label="University email" 
          type="email" 
          placeholder="you@lasustech.edu.ng" 
          leading={<Mail className="h-4 w-4" />} 
          value={formData.email}
          onChange={(e) => update("email", e.target.value)}
          required 
          autoComplete="off"
        />
        
        {role === "student" ? (
          <Field 
            label="Matric number" 
            placeholder="e.g. LAS/22/SCI/00123" 
            value={formData.matric_number}
            onChange={(e) => update("matric_number", e.target.value)}
            required 
            autoComplete="off"
          />
        ) : (
          <Field 
            label="Staff ID" 
            placeholder="e.g. STF/0023" 
            value={formData.staff_id}
            onChange={(e) => update("staff_id", e.target.value)}
            required 
            autoComplete="off"
          />
        )}
        
        <Field 
          label="Create password" 
          type="password" 
          placeholder="At least 8 characters" 
          leading={<Lock className="h-4 w-4" />} 
          hint="Use 8+ characters with a mix of letters and numbers." 
          value={formData.password}
          onChange={(e) => update("password", e.target.value)}
          required 
          autoComplete="new-password"
        />

        <Field 
          label="Confirm password" 
          type="password" 
          placeholder="Repeat your password" 
          leading={<Lock className="h-4 w-4" />} 
          value={formData.confirm_password}
          onChange={(e) => update("confirm_password", e.target.value)}
          required 
          autoComplete="new-password"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:opacity-70"
        >
          {loading ? "Creating your account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

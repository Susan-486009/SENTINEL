import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User } from "lucide-react";
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
  const role = "student";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    matric_number: "",
  });

  const nav = useNavigate();

  const update = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
        role: "student" as const,
        matric: formData.matric_number,
      };

      const data = await authService.register(payload);
      localStorage.setItem("as_access_token", (data as any).accessToken || (data as any).token);
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

        <Field
          label="Matric number"
          placeholder="e.g. LAS/22/SCI/00123"
          value={formData.matric_number}
          onChange={(e) => update("matric_number", e.target.value)}
          required
          autoComplete="off"
        />

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

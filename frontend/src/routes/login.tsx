import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { authService } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — LASUSTECH Resolution Center" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem("as_access_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your reports."
      footer={
        <span>
          New to the platform?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field
          label="University email"
          type="email"
          placeholder="you@lasustech.edu.ng"
          leading={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="Enter your password"
          leading={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.99] disabled:opacity-70"
        >
          {loading ? "Signing you in..." : "Sign in"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our terms and confidentiality policy.
        </p>
      </form>
    </AuthShell>
  );
}

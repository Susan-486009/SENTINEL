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
  const [rememberMe, setRememberMe] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("remembered_identifier");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login({ identifier: email, password });
      
      if (rememberMe) {
        localStorage.setItem("remembered_identifier", email);
      } else {
        localStorage.removeItem("remembered_identifier");
      }

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
      <form onSubmit={submit} className="space-y-5" autoComplete="off">
        <Field
          label="University email"
          type="email"
          placeholder="you@lasustech.edu.ng"
          leading={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
        <Field
          label="Password"
          type="password"
          placeholder="Enter your password"
          leading={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2.5 text-muted-foreground select-none">
            <div className="relative flex h-5 w-5 items-center justify-center">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer h-full w-full appearance-none rounded-lg border border-border bg-card transition-all checked:border-accent checked:bg-accent/10" 
              />
              <div className="pointer-events-none absolute scale-0 text-accent transition-transform peer-checked:scale-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </div>
            <span>Remember me</span>
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

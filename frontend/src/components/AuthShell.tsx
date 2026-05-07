import { Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";
import { Logo } from "./Logo";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left visual panel */}
      <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            A safer way to raise concerns and follow through to resolution.
          </h2>
          <p className="mt-4 text-primary-foreground/75">
            Used by students, faculty, and administration to handle academic and campus
            issues with care, transparency, and accountability.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4" /> Verified institutional access</li>
            <li className="flex items-center gap-3"><Lock className="h-4 w-4" /> Confidential by design</li>
            <li className="flex items-center gap-3"><EyeOff className="h-4 w-4" /> Anonymous reporting available</li>
          </ul>
        </div>
        <div className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Lagos State University of Science and Technology
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 lg:hidden">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

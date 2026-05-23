import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-accent border border-accent/10 shadow-soft">
        <Shield className="h-4.5 w-4.5" strokeWidth={2.25} />
      </div>
      <div className="leading-tight">
        <div
          className={`font-display text-[15px] font-semibold ${light ? "text-white" : "text-foreground"}`}
        >
          LASUSTECH
        </div>
        <div className={`text-[11px] ${light ? "text-white/70" : "text-muted-foreground"}`}>
          Student Resolution Center
        </div>
      </div>
    </Link>
  );
}

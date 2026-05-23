import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { toast } from "sonner";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("as_access_token");
    setIsAuth(!!token);
  }, [path]);

  const logout = () => {
    localStorage.removeItem("as_access_token");
    localStorage.removeItem("user");
    setIsAuth(false);
    setOpen(false);
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/track", label: "Track Case" },
    ...(isAuth ? [{ to: "/dashboard", label: "Dashboard" }] : [{ to: "/login", label: "Sign in" }]),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          {isAuth && (
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              Sign out
            </button>
          )}

          <Link
            to={isAuth ? "/submit" : "/register"}
            className="ml-2 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Submit a report
          </Link>
        </nav>
        <button
          className="inline-flex items-center justify-center rounded-lg p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            {isAuth && (
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            )}
            <Link
              to={isAuth ? "/submit" : "/register"}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
            >
              Submit a report
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

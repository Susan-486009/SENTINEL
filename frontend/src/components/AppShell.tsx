import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Plus, ChevronDown, LogOut, Check, ExternalLink } from "lucide-react";
import { Logo } from "./Logo";
import { useState, type ReactNode } from "react";
import { type User, notificationService } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

/* ... */

export function AppShell({
  nav,
  primaryAction,
  children,
  title,
}: {
  nav: NavItem[];
  primaryAction?: { to: string; label: string };
  children: ReactNode;
  title?: string;
}) {
  const queryClient = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const nav_ = useNavigate();

  const user: User | null = JSON.parse(localStorage.getItem("user") || "null");

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getMine(),
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const logout = () => {
    localStorage.removeItem("as_access_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    nav_({ to: "/login" });
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-screen bg-background">
      {/* ... sidebar ... */}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur-md md:px-8">
          <button
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="mt-1 block h-0.5 w-5 bg-foreground" />
            <span className="mt-1 block h-0.5 w-5 bg-foreground" />
          </button>
          {title && <h1 className="hidden font-display text-lg font-semibold md:block">{title}</h1>}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 md:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search cases, departments..." className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</span>
            </div>
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-xl border border-border bg-card p-2.5 text-muted-foreground hover:text-foreground transition hover:bg-muted/50" 
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
                )}
              </button>
              
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-0 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications?.length > 0 ? notifications.map((n: any) => (
                      <div 
                        key={n._id} 
                        className={`group relative border-b border-border p-4 transition hover:bg-muted/40 ${!n.is_read ? "bg-accent/5" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold">{n.title}</h4>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                        <div className="mt-2 flex items-center gap-3">
                          {n.reference_link && (
                            <Link 
                              to={n.reference_link} 
                              onClick={() => { setNotifOpen(false); markReadMutation.mutate(n._id); }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:underline"
                            >
                              View <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                          {!n.is_read && (
                            <button 
                              onClick={() => markReadMutation.mutate(n._id)}
                              className="text-[10px] font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                            >
                              <Check className="h-2.5 w-2.5" /> Read
                            </button>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="py-10 text-center text-xs text-muted-foreground">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 hover:bg-muted/50 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <span className="hidden text-sm font-medium md:inline">{user?.full_name || "User"}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold truncate">{user?.full_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>

      {open && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)} />}
      {dropdownOpen && <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />}
    </div>
  );
}

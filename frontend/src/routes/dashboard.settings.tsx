import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User as UserIcon, Lock, Bell, Moon, LogOut, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, type User, type UserSettings } from "@/lib/api";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Account settings — LASUSTECH Resolution Center" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch current user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me(),
  });

  // Local state for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    settings: {
      email_notifications: true,
      in_app_notifications: true,
      theme: "light" as "light" | "dark" | "system",
    }
  });

  // Sync local state when user data is fetched
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        settings: {
          email_notifications: user.settings?.email_notifications ?? true,
          in_app_notifications: user.settings?.in_app_notifications ?? true,
          theme: user.settings?.theme ?? "light",
        }
      });
    }
  }, [user]);

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["me"], updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Settings updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings");
    }
  });

  const handleToggle = (key: keyof UserSettings) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key]
      }
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleLogout = () => {
    localStorage.removeItem("as_access_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  if (userLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sections = [
    {
      id: "profile",
      title: "Profile information",
      subtitle: "Manage your personal details and university identity.",
      icon: UserIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      content: (
        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="full-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input 
                id="full-name"
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <input 
                id="email"
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="matric" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Matric / Staff ID</label>
            <input 
              id="matric"
              type="text" 
              value={user?.matric} 
              disabled 
              className="mt-2 w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed outline-none"
            />
            <p className="mt-2 text-[10px] text-muted-foreground italic">Your ID is managed by the institution and cannot be changed manually.</p>
          </div>
        </div>
      )
    },
    {
      id: "security",
      title: "Security & privacy",
      subtitle: "Protect your account with modern security standards.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      content: (
        <div className="divide-y divide-border">
          <button className="flex w-full items-center justify-between p-5 hover:bg-muted/40 transition">
            <div className="text-left">
              <p className="text-sm font-semibold">Change password</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ensure your account uses a strong password</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold">Two-factor auth</p>
              <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of protection</p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Coming Soon</span>
          </div>
        </div>
      )
    },
    {
      id: "notifications",
      title: "Notification preferences",
      subtitle: "Choose how and when you want to stay updated.",
      icon: Bell,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      content: (
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold">Email alerts</p>
              <p className="text-xs text-muted-foreground mt-0.5">Receive updates about your reports via email</p>
            </div>
            <button 
              onClick={() => handleToggle("email_notifications")}
              className={`h-5 w-10 rounded-full transition-colors relative ${formData.settings.email_notifications ? 'bg-accent' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-transform ${formData.settings.email_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold">In-app popups</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show live notifications while browsing</p>
            </div>
            <button 
              onClick={() => handleToggle("in_app_notifications")}
              className={`h-5 w-10 rounded-full transition-colors relative ${formData.settings.in_app_notifications ? 'bg-accent' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-transform ${formData.settings.in_app_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      )
    },
    {
      id: "appearance",
      title: "Interface & Experience",
      subtitle: "Customize the portal to suit your workflow.",
      icon: Moon,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      content: (
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Theme preference</p>
              <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark themes</p>
            </div>
            <select 
              value={formData.settings.theme}
              onChange={(e) => setFormData(p => ({ ...p, settings: { ...p.settings, theme: e.target.value as any } }))}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium outline-none focus:border-accent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-10 px-4 lg:px-0">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Account Settings</h2>
        <p className="mt-2 text-muted-foreground">Manage your identity and customize your resolution experience.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 px-4 lg:px-0">
        {/* Navigation Sidebar - Hidden on small screens or turned into a horizontal scroll */}
        <aside className="lg:col-span-4 lg:block overflow-x-auto">
          <nav className="flex lg:flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-soft min-w-max lg:min-w-0">
            {sections.map((s) => (
              <a 
                key={s.id} 
                href={`#${s.id}`}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-muted whitespace-nowrap"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                {s.title}
              </a>
            ))}
            <hr className="hidden lg:block my-2 border-border" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/5 whitespace-nowrap lg:w-full"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <LogOut className="h-4 w-4" />
              </div>
              Sign out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-8 space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.subtitle}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                {s.content}
              </div>
            </section>
          ))}

          <div className="fixed bottom-0 left-0 right-0 lg:relative flex justify-end gap-3 pt-6 lg:pt-0 lg:border-t lg:border-border bg-background/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 border-t border-border lg:border-0 shadow-2xl lg:shadow-none z-50 lg:z-auto">
            <button 
              onClick={() => navigate({ to: "/dashboard" })}
              className="rounded-xl border border-border bg-background lg:bg-card px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition hover:bg-muted w-full sm:w-auto"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 w-full sm:w-auto"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 animate-spin" />
              ) : null}
              Save changes
            </button>
          </div>
          {/* Spacer for fixed footer on mobile */}
          <div className="lg:hidden h-16" />
        </div>
      </div>
    </div>
  );
}

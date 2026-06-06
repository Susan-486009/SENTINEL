import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  User as UserIcon,
  ShieldCheck,
  Bell,
  Moon,
  Loader2,
  LogOut,
  Save,
  KeyRound
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, type UserSettings } from "@/lib/api";
import { applyTheme } from "@/lib/theme";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Account Settings — LASUSTECH Resolve" }] }),
  component: SettingsPage,
});

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me(),
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    settings: {
      email_notifications: true,
      in_app_notifications: true,
      theme: "light" as "light" | "dark" | "system",
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        settings: {
          email_notifications: user.settings?.email_notifications ?? true,
          in_app_notifications: user.settings?.in_app_notifications ?? true,
          theme: user.settings?.theme ?? "light",
        },
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["me"], updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile settings saved successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save settings");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to change password");
    },
  });

  const handleToggle = (key: keyof UserSettings) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key],
      },
    }));
  };

  const handleSaveProfile = () => {
    updateMutation.mutate(formData);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("as_access_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  if (userLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information, security preferences, and overall app experience.
        </p>
      </div>

      <motion.div variants={sectionVariants} initial="hidden" animate="show" className="space-y-6">
        {/* Profile Details */}
        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium">Profile Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Matric / Staff ID
              </label>
              <input
                type="text"
                value={user?.matric || ""}
                disabled
                className="mt-2 w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed outline-none"
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Your ID is tied to your institutional record and cannot be changed here.
              </p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium">Security & Password</h3>
            </div>
          </div>
          <div className="p-6">
            {!showPasswordForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Update Password</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted transition"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleSavePassword} className="space-y-4 animate-in fade-in">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition disabled:opacity-50"
                  >
                    {passwordMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
                    Save Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium">Preferences</h3>
            </div>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium">Email Alerts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive updates about your complaints directly to your inbox.
                </p>
              </div>
              <button
                onClick={() => handleToggle("email_notifications")}
                className={`h-5 w-10 rounded-full transition-colors relative ${formData.settings.email_notifications ? "bg-accent" : "bg-muted"}`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${formData.settings.email_notifications ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium">In-app Notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Show live toast notifications while you are using the portal.
                </p>
              </div>
              <button
                onClick={() => handleToggle("in_app_notifications")}
                className={`h-5 w-10 rounded-full transition-colors relative ${formData.settings.in_app_notifications ? "bg-accent" : "bg-muted"}`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${formData.settings.in_app_notifications ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Theme</p>
                </div>
              </div>
              <select
                value={formData.settings.theme}
                onChange={(e) => {
                  const newTheme = e.target.value as any;
                  setFormData((p) => ({
                    ...p,
                    settings: { ...p.settings, theme: newTheme },
                  }));
                  applyTheme(newTheme);
                }}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium outline-none focus:border-accent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </section>

        {/* Global Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/20 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out of account
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent/90 transition disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}

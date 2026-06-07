export type Theme = "light" | "dark" | "system";

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = window.document.documentElement;
  
  const isDark = 
    theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Dispatch custom event to notify __root.tsx
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: theme }));
}

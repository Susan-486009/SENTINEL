import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster, toast } from "sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  console.error("Root Boundary Error Captured:", error);
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-8 shadow-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          An unexpected application error was safely caught by Sentinel security boundaries.
        </p>

        {error.requestId && (
          <div className="mt-4 rounded-lg bg-muted/60 px-4 py-2 text-xs font-mono text-muted-foreground flex items-center justify-center gap-1.5 border border-border/40">
            <span>Correlation ID:</span>
            <span className="font-semibold text-foreground select-all">{error.requestId}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Try Again
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent/40 active:scale-[0.98]"
          >
            {showDetails ? "Hide technical details" : "View technical details"}
          </button>
        </div>

        {showDetails && (
          <div className="mt-6 text-left border-t border-border/50 pt-5">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Error Details
            </h3>
            <pre className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-muted/80 p-3 text-xs font-mono text-muted-foreground border border-border/40 whitespace-pre-wrap break-all leading-normal">
              {error.stack || error.message || String(error)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LASUSTECH Student Resolution Center" },
      {
        name: "description",
        content:
          "A secure platform for LASUSTECH students and staff to report academic, administrative, and campus concerns — and track them transparently.",
      },
      { property: "og:title", content: "LASUSTECH Student Resolution Center" },
      { property: "og:description", content: "Report issues safely. Track them transparently." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Theme management
  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const theme = user.settings?.theme || "light";
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {}
    }
  }, []);

  // Real-time network health monitor
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      toast.success("Your internet connection has been restored!", {
        id: "offline-toast",
        duration: 4000,
      });
      // Force reload all TanStack queries
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      toast.error("You are currently offline. Active database synchronization is paused.", {
        id: "offline-toast",
        duration: Infinity,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <Outlet />
    </QueryClientProvider>
  );
}

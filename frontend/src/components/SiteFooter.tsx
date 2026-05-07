import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A secure, transparent reporting and resolution platform for the Lagos State
            University of Science and Technology community.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/track" className="hover:text-foreground">Track a case</Link></li>
            <li><Link to="/register" className="hover:text-foreground">Submit a report</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Privacy policy</li>
            <li>Terms of use</li>
            <li>Contact administration</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} LASUSTECH. All rights reserved.</span>
          <span>Confidential by design · Secure by default</span>
        </div>
      </div>
    </footer>
  );
}

import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileText, MessageSquare, ShieldCheck, TrendingUp } from "lucide-react";

export function DashboardPreview() {
  const stages = [
    { label: "Submitted", done: true, time: "Mon, 9:14 AM" },
    { label: "Under review", done: true, time: "Mon, 11:02 AM" },
    { label: "Assigned to Faculty Office", done: true, time: "Tue, 8:30 AM" },
    { label: "In progress", done: false, time: "In progress" },
    { label: "Resolved", done: false, time: "" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-accent/10 via-primary/5 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-20px_rgb(15_23_42_/_0.18)]">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </div>
          <div className="rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">
            resolution.lasustech.edu/cases/RC-48201
          </div>
          <div className="w-12" />
        </div>

        <div className="grid grid-cols-12 gap-4 p-5">
          {/* Stats */}
          <div className="col-span-12 grid grid-cols-3 gap-3">
            {[
              { label: "Open", value: "12", icon: FileText, tint: "text-accent" },
              { label: "Avg. response", value: "3.2h", icon: Clock, tint: "text-warning" },
              { label: "Resolved", value: "186", icon: CheckCircle2, tint: "text-success" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">{s.label}</span>
                  <s.icon className={`h-4 w-4 ${s.tint}`} />
                </div>
                <div className="mt-1.5 text-xl font-semibold tracking-tight">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Case card */}
          <div className="col-span-12 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-info/10 px-2.5 py-0.5 text-[11px] font-medium text-info">
                    Under review
                  </span>
                  <span className="text-[11px] text-muted-foreground">Case #RC-48201</span>
                </div>
                <h3 className="mt-2 font-display text-[15px] font-semibold">
                  Delayed result publication — Faculty of Science
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Submitted by verified student · Confidential
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Timeline */}
            <ol className="mt-4 space-y-3">
              {stages.map((st, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="relative mt-0.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        st.done
                          ? "border-success bg-success text-success-foreground"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {st.done ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
                    </div>
                    {i < stages.length - 1 && (
                      <span className="absolute left-1/2 top-5 h-5 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <span className={`text-xs ${st.done ? "text-foreground" : "text-muted-foreground"}`}>{st.label}</span>
                    <span className="text-[11px] text-muted-foreground">{st.time}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Activity */}
          <div className="col-span-12 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Latest update from Faculty Office</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              "Thank you for reaching out. Your case has been reviewed and assigned to the
              examinations officer. We'll share the next update by Friday."
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Verified administrator response
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  EyeOff,
  Lock,
  LineChart,
  Scale,
  FileText,
  Search,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DashboardPreview } from "@/components/DashboardPreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LASUSTECH Student Resolution Center — Report safely, track transparently" },
      { name: "description", content: "A secure platform for LASUSTECH students and staff to report academic, administrative, and campus-related concerns." },
    ],
  }),
  component: LandingPage,
});

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function LandingPage() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem("as_access_token"));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero isAuth={isAuth} />
      <HowItWorks />
      <TrustSection />
      <FAQSection />
      <CTASection isAuth={isAuth} />
      <SiteFooter />
    </div>
  );
}

function Hero({ isAuth }: { isAuth: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grid-bg opacity-60" />
      <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Confidential · Secure · Transparent
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-[56px]">
            Report issues safely.
            <br />
            <span className="text-accent">Track them transparently.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            A secure platform for LASUSTECH students and staff to report academic,
            administrative, and campus-related concerns — and follow every step toward resolution.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={isAuth ? "/submit" : "/register"}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.98]"
            >
              {isAuth ? "Submit a report" : "Create an account"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to={isAuth ? "/dashboard" : "/track"}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium transition hover:bg-muted active:scale-[0.98]"
            >
              {isAuth ? "Go to Dashboard" : "Track existing case"}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> End-to-end secure</span>
            <span className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5" /> Anonymous option</span>
            <span className="inline-flex items-center gap-1.5"><Scale className="h-3.5 w-3.5" /> Institutional accountability</span>
          </div>
        </motion.div>

        <DashboardPreview />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Submit your report",
      desc: "Walk through a guided form. Add details, attach evidence, or stay anonymous.",
    },
    {
      icon: Search,
      title: "Review process",
      desc: "Your case is routed to the right department and reviewed by a real administrator.",
    },
    {
      icon: CheckCircle2,
      title: "Resolution & tracking",
      desc: "Follow every update with a transparent timeline until your case is resolved.",
    },
  ];
  return (
    <section className="border-t border-border bg-surface">
      <div className="container-page py-20 md:py-24">
        <motion.div {...fade} className="max-w-2xl">
          <span className="text-sm font-medium text-accent">How it works</span>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            From concern to resolution, in three clear steps.
          </h2>
          <p className="mt-3 text-muted-foreground">
            We designed this process to be simple, supportive, and easy to follow — no
            paperwork, no waiting in offices, no guessing what happens next.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              {...fade}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-1 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    { icon: Lock, title: "Confidential reporting", desc: "Your information is encrypted and only seen by authorized administrators." },
    { icon: EyeOff, title: "Anonymous submissions", desc: "Choose to submit a report without sharing your identity." },
    { icon: ShieldCheck, title: "Secure file uploads", desc: "Upload supporting evidence safely with end-to-end protection." },
    { icon: LineChart, title: "Transparent tracking", desc: "See real-time progress on your case from submission to resolution." },
    { icon: Scale, title: "Administrative accountability", desc: "Every action is logged, ensuring fair handling at every step." },
  ];
  return (
    <section className="border-t border-border">
      <div className="container-page py-20 md:py-24">
        <motion.div {...fade} className="max-w-2xl">
          <span className="text-sm font-medium text-accent">Trust & safety</span>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            Built on principles that protect you.
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              {...fade}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{it.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Can I report something anonymously?", a: "Yes. You can choose to submit your report without revealing your identity. We'll still provide a tracking ID so you can follow updates." },
  { q: "How quickly will I receive a response?", a: "Most reports receive an initial response within 24–72 hours during the academic session. Urgent matters are prioritized." },
  { q: "What kind of evidence can I upload?", a: "You may upload images, documents, and PDFs (up to 25MB per file). All uploads are stored securely and are only accessible to authorized staff." },
  { q: "How do I track an existing case?", a: "Use the tracking ID issued at submission on the Track Case page to view your case status, timeline, and the latest updates." },
  { q: "Who can see my report?", a: "Only authorized administrators in the relevant department, plus the institutional review office. Access is logged for accountability." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-t border-border bg-surface">
      <div className="container-page py-20 md:py-24">
        <motion.div {...fade} className="max-w-2xl">
          <span className="text-sm font-medium text-accent">Common questions</span>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            Everything you might be wondering.
          </h2>
        </motion.div>
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={f.q}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full px-6 py-5 text-left transition hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-6">
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
                </div>
                {isOpen && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-muted-foreground">
                    {f.a}
                  </motion.p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection({ isAuth }: { isAuth: boolean }) {
  return (
    <section className="border-t border-border">
      <div className="container-page py-16">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
          <div className="absolute inset-0 -z-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="font-display text-2xl font-semibold md:text-3xl">Have a concern? You're not alone.</h3>
              <p className="mt-2 max-w-xl text-primary-foreground/75">
                Submit a report in minutes. We'll guide you through every step.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={isAuth ? "/submit" : "/register"} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-primary transition hover:bg-white/90">
                Submit a report <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={isAuth ? "/dashboard" : "/track"} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                {isAuth ? "Go to Dashboard" : "Track a case"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

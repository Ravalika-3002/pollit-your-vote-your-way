import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Lock, Sparkles, Users, Zap } from "lucide-react";
import { LogoBrand, logoBrandClass } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PollIt — Live polls with style" },
      { name: "description", content: "Create polls, invite friends, and watch results stream in. Modern, secure, and ridiculously fast." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 px-6 md:px-12 py-4 md:py-6">
        <Link to="/" className="shrink-0">
          <LogoBrand className={logoBrandClass} />
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
            Sign in
          </Link>
          <Link to="/signup" className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition">
            Get started
          </Link>
        </nav>
      </header>

      <main className="px-6 md:px-12">
        <section className="mx-auto max-w-6xl pt-12 md:pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan" />
            Built for hackathons, teams, and communities
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-5xl md:text-7xl font-bold tracking-tight"
          >
            Polls that feel <span className="text-gradient">alive.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Create single-choice or multi-choice polls, share with anyone, control who sees results, and watch the chart light up in real time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition">
              Create your first poll <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link to="/login" className="rounded-xl glass px-6 py-3 font-semibold hover:border-border transition">
              I already have an account
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 mx-auto max-w-4xl"
          >
            <div className="glass-strong rounded-3xl p-2 ring-glow">
              <div className="rounded-2xl bg-background/60 p-8 text-left">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Live preview</div>
                <h3 className="mt-2 text-2xl font-semibold">Which framework do you ship with?</h3>
                <div className="mt-6 space-y-3">
                  {[
                    { l: "React + Vite", v: 64 },
                    { l: "Next.js", v: 22 },
                    { l: "SvelteKit", v: 14 },
                  ].map((b) => (
                    <div key={b.l}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span>{b.l}</span><span className="text-muted-foreground">{b.v}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${b.v}%` }}
                          transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
                          className="h-full bg-gradient-brand"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl py-16 grid md:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "Ship a poll in seconds", body: "Title, options, share — done. No setup, no friction." },
            { icon: Lock, title: "Granular access control", body: "Public feeds, private invites, and result gates you control." },
            { icon: BarChart3, title: "Live results, beautiful charts", body: "Counts, percentages, and respondents — always crisp." },
            { icon: Users, title: "Invite by email", body: "Bring exactly the people you need into private polls." },
            { icon: Sparkles, title: "Lifecycle done right", body: "Draft, open, closed — votes stay honest at every stage." },
            { icon: ArrowRight, title: "Change your mind", body: "Voters can update or withdraw votes while the poll is open." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:border-gradient transition"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-soft flex items-center justify-center">
                <f.icon className="h-5 w-5 text-cyan" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </section>

        <section className="mx-auto max-w-4xl py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to <span className="text-gradient">PollIt</span>?</h2>
          <p className="mt-4 text-muted-foreground">Free to start. Beautiful by default.</p>
          <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-7 py-3.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
            Create my account <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-6 md:px-12 py-8 text-sm text-muted-foreground flex justify-between">
        <span>© {new Date().getFullYear()} PollIt</span>
        <span>Crafted with care.</span>
      </footer>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle2, Plus, Sparkles, Vote } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { listMyPolls, listSharedWithMe } from "@/lib/poll-service";
import { PollCard, EmptyState } from "@/components/PollCard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PollIt" }, { name: "description", content: "Your PollIt dashboard" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const myPolls = useQuery({
    queryKey: ["my-polls", user?.id],
    queryFn: () => listMyPolls(user!.id),
    enabled: !!user,
  });
  const shared = useQuery({
    queryKey: ["shared", user?.id],
    queryFn: () => listSharedWithMe(user!.id),
    enabled: !!user,
  });

  const polls = myPolls.data ?? [];
  const stats = [
    { label: "Total polls", value: polls.length, icon: BarChart3, color: "text-cyan" },
    { label: "Active polls", value: polls.filter((p) => p.status === "open").length, icon: Vote, color: "text-blue" },
    { label: "Drafts", value: polls.filter((p) => p.status === "draft").length, icon: Sparkles, color: "text-purple" },
    { label: "Closed", value: polls.filter((p) => p.status === "closed").length, icon: CheckCircle2, color: "text-magenta" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            <span className="text-gradient">{user?.user_metadata?.display_name ?? user?.email?.split("@")[0]}</span>
          </h1>
        </div>
        <Link to="/polls/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          <Plus className="h-4 w-4" /> New poll
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent polls</h2>
          <Link to="/my-polls" className="text-sm text-cyan inline-flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {polls.length === 0 ? (
          <EmptyState title="No polls yet" description="Create your first poll to see it here."
            action={<Link to="/polls/new" className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Create poll</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.slice(0, 6).map((p) => (
              <PollCard key={p.id} poll={p} options={p.poll_options?.length ?? 0} />
            ))}
          </div>
        )}
      </section>

      {(shared.data?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Shared with you</h2>
            <Link to="/shared" className="text-sm text-cyan inline-flex items-center gap-1 hover:underline">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(shared.data as never[]).slice(0, 3).map((p: { id: string; poll_options?: unknown[] } & Record<string, unknown>) => (
              <PollCard key={p.id} poll={p as never} options={p.poll_options?.length ?? 0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

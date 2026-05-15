import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { listMyPolls } from "@/lib/poll-service";
import { PollCard, EmptyState } from "@/components/PollCard";

export const Route = createFileRoute("/_authenticated/my-polls")({
  head: () => ({ meta: [{ title: "My polls — PollIt" }, { name: "description", content: "All polls you've created" }] }),
  component: MyPolls,
});

function MyPolls() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["my-polls", user?.id], queryFn: () => listMyPolls(user!.id), enabled: !!user });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const polls = (data ?? []).filter((p) =>
    (status === "all" || p.status === status) &&
    (q === "" || p.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My polls</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage everything you've created.</p>
        </div>
        <Link to="/polls/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"><Plus className="h-4 w-4" /> New poll</Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search polls"
            className="w-full rounded-lg bg-input border border-border pl-9 pr-3 py-2.5 text-sm" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg bg-input border border-border px-3 py-2.5 text-sm">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {polls.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Try a different filter, or create a new poll."
          action={<Link to="/polls/new" className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Create poll</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {polls.map((p) => <PollCard key={p.id} poll={p} options={p.poll_options?.length ?? 0} />)}
        </div>
      )}
    </div>
  );
}

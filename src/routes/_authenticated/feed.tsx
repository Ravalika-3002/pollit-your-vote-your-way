import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { listPublicPolls } from "@/lib/poll-service";
import { PollCard, EmptyState } from "@/components/PollCard";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Public feed — PollIt" }, { name: "description", content: "Discover public polls" }] }),
  component: Feed,
});

function Feed() {
  const { data } = useQuery({ queryKey: ["feed"], queryFn: () => listPublicPolls() });
  const [q, setQ] = useState("");
  const polls = (data ?? []).filter((p) => q === "" || p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Public feed</h1>
      <p className="text-muted-foreground text-sm mb-6">Discover polls created by the community.</p>
      <div className="relative mb-6">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search public polls"
          className="w-full rounded-lg bg-input border border-border pl-9 pr-3 py-2.5 text-sm" />
      </div>
      {polls.length === 0 ? (
        <EmptyState title="Nothing in the feed yet" description="Be the first to publish a public poll." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {polls.map((p) => <PollCard key={p.id} poll={p} options={p.poll_options?.length ?? 0} />)}
        </div>
      )}
    </div>
  );
}

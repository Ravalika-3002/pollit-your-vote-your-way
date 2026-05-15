import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listSharedWithMe } from "@/lib/poll-service";
import { PollCard, EmptyState } from "@/components/PollCard";

export const Route = createFileRoute("/_authenticated/shared")({
  head: () => ({ meta: [{ title: "Shared with me — PollIt" }, { name: "description", content: "Polls shared with you" }] }),
  component: Shared,
});

function Shared() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["shared", user?.id], queryFn: () => listSharedWithMe(user!.id), enabled: !!user });
  const polls = (data ?? []) as never[];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Shared with me</h1>
      <p className="text-muted-foreground text-sm mb-6">Private polls people invited you to.</p>
      {polls.length === 0 ? (
        <EmptyState title="No invitations yet" description="When someone invites you to a private poll, it'll show up here." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {polls.map((p: { id: string; poll_options?: unknown[] } & Record<string, unknown>) =>
            <PollCard key={p.id} poll={p as never} options={p.poll_options?.length ?? 0} />
          )}
        </div>
      )}
    </div>
  );
}

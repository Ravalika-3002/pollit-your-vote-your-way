import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Copy, Edit3, Eye, EyeOff, Globe, Lock, Send, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchPoll, fetchResults, fetchUserVote, castVote, withdrawVote,
  setStatus, deletePoll, listInvitations, inviteUserByEmail, removeInvitation,
} from "@/lib/poll-service";
import { ResultsChart } from "@/components/ResultsChart";

export const Route = createFileRoute("/_authenticated/polls/$id")({
  head: () => ({ meta: [{ title: "Poll — PollIt" }, { name: "description", content: "View and vote on a poll" }] }),
  component: PollDetail,
});

function PollDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const loc = useLocation();
  const isEditing = loc.pathname.endsWith("/edit");

  const pollQ = useQuery({ queryKey: ["poll", id], queryFn: () => fetchPoll(id) });
  const voteQ = useQuery({ queryKey: ["vote", id, user?.id], queryFn: () => fetchUserVote(id, user!.id), enabled: !!user });
  const resultsQ = useQuery({ queryKey: ["results", id], queryFn: () => fetchResults(id) });

  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteLink(window.location.href);
    }
  }, []);

  if (pollQ.isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!pollQ.data) return <div className="glass rounded-2xl p-10 text-center">Poll not found or you don't have access.</div>;
  const poll = pollQ.data;

  if (isEditing) {
    return <Outlet />;
  }
  const isCreator = user?.id === poll.creator_id;
  const hasVoted = (voteQ.data?.optionIds.length ?? 0) > 0;
  const showResults =
    isCreator || poll.results_visibility === "always" || (poll.results_visibility === "after_vote" && hasVoted);
  const canVote = poll.status === "open";

  // hydrate selected from existing vote
  if (voteQ.data && selected.length === 0 && voteQ.data.optionIds.length > 0) {
    setSelected(voteQ.data.optionIds);
  }

  function toggle(optId: string) {
    if (poll!.poll_type === "single") setSelected([optId]);
    else setSelected((s) => s.includes(optId) ? s.filter((x) => x !== optId) : [...s, optId]);
  }

  async function submit() {
    if (selected.length === 0) return toast.error("Pick at least one option");
    setBusy(true);
    try {
      await castVote(id, user!.id, selected);
      toast.success(hasVoted ? "Vote updated" : "Vote recorded");
      qc.invalidateQueries({ queryKey: ["vote", id] });
      qc.invalidateQueries({ queryKey: ["results", id] });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  async function withdraw() {
    setBusy(true);
    try {
      await withdrawVote(id, user!.id);
      setSelected([]);
      toast.success("Vote withdrawn");
      qc.invalidateQueries({ queryKey: ["vote", id] });
      qc.invalidateQueries({ queryKey: ["results", id] });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  async function changeStatus(s: "draft" | "open" | "closed") {
    try { await setStatus(id, s); toast.success(`Poll ${s}`); qc.invalidateQueries({ queryKey: ["poll", id] }); }
    catch (e) { toast.error((e as Error).message); }
  }

  async function onDelete() {
    if (!confirm("Delete this draft permanently?")) return;
    try { await deletePoll(id); toast.success("Deleted"); nav({ to: "/my-polls" }); }
    catch (e) { toast.error((e as Error).message); }
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink || window.location.href);
    toast.success("Link copied");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div>
        <div className="glass-strong rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <Badge>{poll.status}</Badge>
            <Badge>{poll.poll_type === "single" ? "single choice" : "multiple choice"}</Badge>
            <Badge icon={poll.visibility === "public" ? Globe : Lock}>{poll.visibility}</Badge>
            <Badge icon={poll.results_visibility === "always" ? Eye : EyeOff}>
              results {poll.results_visibility === "always" ? "always" : "after vote"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{poll.title}</h1>
          {poll.description && <p className="mt-3 text-muted-foreground">{poll.description}</p>}

          <div className="mt-7 space-y-2.5">
            {poll.poll_options.map((opt) => {
              const sel = selected.includes(opt.id);
              return (
                <motion.button
                  whileTap={{ scale: 0.98 }} key={opt.id}
                  disabled={!canVote || isCreator && poll.status === "draft"}
                  onClick={() => toggle(opt.id)}
                  className={`w-full text-left flex items-center gap-3 rounded-xl px-4 py-3.5 border transition ${
                    sel ? "border-transparent bg-gradient-soft ring-1 ring-primary/40" : "border-border glass hover:border-gradient"
                  } ${!canVote ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  <div className={`h-5 w-5 shrink-0 rounded-${poll.poll_type === "single" ? "full" : "md"} border-2 ${sel ? "bg-gradient-brand border-transparent" : "border-border"} flex items-center justify-center`}>
                    {sel && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="font-medium">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>

          {canVote && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button disabled={busy} onClick={submit}
                className="rounded-lg bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60">
                {hasVoted ? "Update vote" : "Submit vote"}
              </button>
              {hasVoted && (
                <button disabled={busy} onClick={withdraw}
                  className="rounded-lg glass px-5 py-2.5 font-semibold hover:text-destructive">
                  Withdraw vote
                </button>
              )}
            </div>
          )}
          {poll.status === "closed" && <p className="mt-5 text-sm text-muted-foreground">This poll is closed. Voting is disabled.</p>}
          {poll.status === "draft" && <p className="mt-5 text-sm text-muted-foreground">Draft — publish to start collecting votes.</p>}
        </div>

        {showResults && resultsQ.data && (
          <div className="glass rounded-2xl p-6 md:p-8 mt-6">
            <h2 className="text-xl font-semibold mb-5">Results</h2>
            <ResultsChart results={resultsQ.data} />
            {poll.poll_type === "multiple" && <p className="mt-4 text-xs text-muted-foreground">Multiple choice — percentages may exceed 100%.</p>}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Invite link</h3>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-surface p-3 text-sm text-muted-foreground break-all">{inviteLink || "Loading invite link..."}</div>
            <button onClick={copyLink} className="w-full inline-flex items-center justify-center gap-2 rounded-lg glass-strong px-4 py-2.5 text-sm hover:border-gradient">
              <Copy className="h-4 w-4" /> Copy invite link
            </button>
          </div>
        </div>

        {isCreator && (
          <>
            <div className="glass rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-semibold mb-2">Manage</h3>
              {poll.status === "draft" && (
                <>
                  <Link to="/polls/$id/edit" params={{ id: poll.id }} className="w-full inline-flex items-center gap-2 rounded-lg glass-strong px-4 py-2 text-sm hover:border-gradient">
                    <Edit3 className="h-4 w-4" /> Edit draft
                  </Link>
                  <button onClick={() => changeStatus("open")} className="w-full inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground">
                    Publish
                  </button>
                  <button onClick={onDelete} className="w-full inline-flex items-center gap-2 rounded-lg glass-strong px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </>
              )}
              {poll.status === "open" && (
                <button onClick={() => changeStatus("closed")} className="w-full rounded-lg glass-strong px-4 py-2 text-sm hover:border-gradient">
                  Close poll
                </button>
              )}
            </div>

            {poll.visibility === "private" && <InvitePanel pollId={poll.id} />}
          </>
        )}
      </aside>
    </div>
  );
}

function Badge({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-xs uppercase tracking-wide text-muted-foreground">
      {Icon && <Icon className="h-3 w-3" />} {children}
    </span>
  );
}

function InvitePanel({ pollId }: { pollId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const invs = useQuery({ queryKey: ["invs", pollId], queryFn: () => listInvitations(pollId) });

  async function invite() {
    if (!email.trim()) return;
    try { await inviteUserByEmail(pollId, email.trim(), user!.id); setEmail(""); toast.success("Invited"); qc.invalidateQueries({ queryKey: ["invs", pollId] }); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function remove(id: string) {
    await removeInvitation(id);
    qc.invalidateQueries({ queryKey: ["invs", pollId] });
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-3">Invite people</h3>
      <div className="flex gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
          className="flex-1 rounded-lg bg-input border border-border px-3 py-2 text-sm" />
        <button onClick={invite} className="rounded-lg bg-gradient-brand p-2 text-primary-foreground"><Send className="h-4 w-4" /></button>
      </div>
      <ul className="mt-4 space-y-1.5">
        {(invs.data ?? []).map((i: { id: string; profiles: { email: string | null; display_name: string | null } | null }) => (
          <li key={i.id} className="flex items-center justify-between text-xs glass-strong rounded-lg px-2.5 py-1.5">
            <span className="truncate">{i.profiles?.display_name ?? i.profiles?.email}</span>
            <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
          </li>
        ))}
        {(invs.data?.length ?? 0) === 0 && <li className="text-xs text-muted-foreground">No invitations yet.</li>}
      </ul>
    </div>
  );
}

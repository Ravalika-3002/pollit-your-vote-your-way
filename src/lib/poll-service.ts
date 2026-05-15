import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Poll = Database["public"]["Tables"]["polls"]["Row"];
export type PollOption = Database["public"]["Tables"]["poll_options"]["Row"];
export type PollWithOptions = Poll & { poll_options: PollOption[] };

export type PollResults = {
  totalRespondents: number;
  options: { id: string; label: string; count: number; percentage: number }[];
};

export interface CreatePollInput {
  title: string;
  description?: string;
  poll_type: "single" | "multiple";
  visibility: "public" | "private";
  results_visibility: "always" | "after_vote";
  end_at?: string | null;
  options: string[];
  status: "draft" | "open";
}

export async function createPoll(input: CreatePollInput, userId: string) {
  // Re-validate session against the server so creator_id always matches auth.uid()
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    throw new Error("Your session has expired. Please sign out and sign in again.");
  }
  const creatorId = auth.user.id;
  if (creatorId !== userId) {
    // stale local session — use the verified id
    console.warn("[createPoll] session user mismatch; using server-verified id");
  }
  const pollId = crypto.randomUUID();
  const poll = {
    id: pollId,
    creator_id: creatorId,
    title: input.title,
    description: input.description ?? null,
    poll_type: input.poll_type,
    visibility: input.visibility,
    results_visibility: input.results_visibility,
    status: input.status,
    end_at: input.end_at ?? null,
  };

  const { error } = await supabase
    .from("polls")
    .insert(poll);
  if (error) throw error;

  const opts = input.options
    .map((label, i) => ({ poll_id: poll.id, label: label.trim(), position: i }))
    .filter((o) => o.label.length > 0);
  if (opts.length) {
    const { error: oe } = await supabase.from("poll_options").insert(opts);
    if (oe) throw oe;
  }
  return poll;
}

export async function updatePoll(pollId: string, patch: Partial<CreatePollInput>) {
  const { options, ...rest } = patch;
  const { error } = await supabase.from("polls").update(rest as never).eq("id", pollId);
  if (error) throw error;
  if (options) {
    // delete & re-insert
    await supabase.from("poll_options").delete().eq("poll_id", pollId);
    const opts = options
      .map((label, i) => ({ poll_id: pollId, label: label.trim(), position: i }))
      .filter((o) => o.label.length > 0);
    if (opts.length) {
      const { error: oe } = await supabase.from("poll_options").insert(opts);
      if (oe) throw oe;
    }
  }
}

export async function fetchPoll(pollId: string): Promise<PollWithOptions | null> {
  const { data, error } = await supabase
    .from("polls")
    .select("*, poll_options(*)")
    .eq("id", pollId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  data.poll_options.sort((a: PollOption, b: PollOption) => a.position - b.position);
  return data as PollWithOptions;
}

export async function fetchResults(pollId: string): Promise<PollResults> {
  const { data: opts } = await supabase
    .from("poll_options").select("id, label, position").eq("poll_id", pollId).order("position");
  const { count: total } = await supabase
    .from("votes").select("*", { count: "exact", head: true }).eq("poll_id", pollId);
  const { data: voteOpts } = await supabase
    .from("vote_options")
    .select("option_id, votes!inner(poll_id)")
    .eq("votes.poll_id", pollId);

  const counts = new Map<string, number>();
  (voteOpts ?? []).forEach((v: { option_id: string }) => {
    counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1);
  });
  const totalR = total ?? 0;
  return {
    totalRespondents: totalR,
    options: (opts ?? []).map((o) => {
      const c = counts.get(o.id) ?? 0;
      return { id: o.id, label: o.label, count: c, percentage: totalR > 0 ? (c / totalR) * 100 : 0 };
    }),
  };
}

export async function fetchUserVote(pollId: string, userId: string) {
  const { data: vote } = await supabase
    .from("votes").select("id").eq("poll_id", pollId).eq("user_id", userId).maybeSingle();
  if (!vote) return { voteId: null, optionIds: [] as string[] };
  const { data: vo } = await supabase
    .from("vote_options").select("option_id").eq("vote_id", vote.id);
  return { voteId: vote.id, optionIds: (vo ?? []).map((x) => x.option_id) };
}

export async function castVote(pollId: string, userId: string, optionIds: string[]) {
  // delete existing
  await supabase.from("votes").delete().eq("poll_id", pollId).eq("user_id", userId);
  if (optionIds.length === 0) return;
  const { data: vote, error } = await supabase
    .from("votes").insert({ poll_id: pollId, user_id: userId }).select().single();
  if (error) throw error;
  const { error: e2 } = await supabase
    .from("vote_options").insert(optionIds.map((o) => ({ vote_id: vote.id, option_id: o })));
  if (e2) throw e2;
}

export async function withdrawVote(pollId: string, userId: string) {
  await supabase.from("votes").delete().eq("poll_id", pollId).eq("user_id", userId);
}

export async function setStatus(pollId: string, status: "draft" | "open" | "closed") {
  const { error } = await supabase.from("polls").update({ status }).eq("id", pollId);
  if (error) throw error;
}

export async function deletePoll(pollId: string) {
  const { error } = await supabase.from("polls").delete().eq("id", pollId);
  if (error) throw error;
}

export async function listPublicPolls() {
  const { data, error } = await supabase
    .from("polls")
    .select("*, poll_options(id)")
    .eq("visibility", "public")
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listMyPolls(userId: string) {
  const { data, error } = await supabase
    .from("polls").select("*, poll_options(id)").eq("creator_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listSharedWithMe(userId: string) {
  const { data, error } = await supabase
    .from("invitations")
    .select("poll_id, polls(*, poll_options(id))")
    .eq("invited_user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.polls).filter(Boolean) as never[];
}

export async function inviteUserByEmail(pollId: string, email: string, byUserId: string) {
  const { data: profile } = await supabase
    .from("profiles").select("id").eq("email", email).maybeSingle();
  if (!profile) throw new Error("No user with that email exists yet");
  const { error } = await supabase
    .from("invitations").insert({ poll_id: pollId, invited_user_id: profile.id, invited_by: byUserId });
  if (error) throw error;
}

export async function listInvitations(pollId: string) {
  const { data: invs } = await supabase
    .from("invitations").select("id, invited_at, invited_user_id").eq("poll_id", pollId);
  if (!invs?.length) return [];
  const ids = invs.map((i) => i.invited_user_id);
  const { data: profs } = await supabase
    .from("profiles").select("id, email, display_name").in("id", ids);
  const pmap = new Map((profs ?? []).map((p) => [p.id, p]));
  return invs.map((i) => ({
    id: i.id,
    invited_at: i.invited_at,
    profiles: pmap.get(i.invited_user_id) ?? null,
  }));
}

export async function removeInvitation(invitationId: string) {
  await supabase.from("invitations").delete().eq("id", invitationId);
}

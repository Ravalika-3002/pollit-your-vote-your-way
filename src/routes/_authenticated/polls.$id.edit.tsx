import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { fetchPoll, updatePoll, type CreatePollInput } from "@/lib/poll-service";

export const Route = createFileRoute("/_authenticated/polls/$id/edit")({
  head: () => ({ meta: [{ title: "Edit poll — PollIt" }, { name: "description", content: "Edit your poll draft" }] }),
  component: EditPoll,
});

const inputCls = "w-full rounded-lg bg-input border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60";

function EditPoll() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { data: poll } = useQuery({ queryKey: ["poll", id], queryFn: () => fetchPoll(id) });
  const [form, setForm] = useState<CreatePollInput | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (poll && !form) {
      setForm({
        title: poll.title, description: poll.description ?? "",
        poll_type: poll.poll_type, visibility: poll.visibility,
        results_visibility: poll.results_visibility,
        end_at: poll.end_at, status: poll.status === "draft" ? "draft" : "open",
        options: poll.poll_options.map((o) => o.label),
      });
    }
  }, [poll, form]);

  if (!form || !poll) return <div className="text-muted-foreground">Loading…</div>;

  function set<K extends keyof CreatePollInput>(k: K, v: CreatePollInput[K]) {
    setForm((f) => f ? { ...f, [k]: v } : f);
  }

  async function save() {
    setSaving(true);
    try {
      await updatePoll(id, form!);
      toast.success("Saved");
      nav({ to: "/polls/$id", params: { id } });
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit poll</h1>
      <div className="glass-strong rounded-2xl p-6 space-y-5">
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Title" />
        <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} className={inputCls} placeholder="Description" />
        <div className="grid sm:grid-cols-2 gap-4">
          <select value={form.poll_type} onChange={(e) => set("poll_type", e.target.value as never)} className={inputCls}>
            <option value="single">Single choice</option><option value="multiple">Multiple choice</option>
          </select>
          <select value={form.visibility} onChange={(e) => set("visibility", e.target.value as never)} className={inputCls}>
            <option value="public">Public</option><option value="private">Private</option>
          </select>
          <select value={form.results_visibility} onChange={(e) => set("results_visibility", e.target.value as never)} className={inputCls}>
            <option value="always">Results always visible</option><option value="after_vote">Results after vote</option>
          </select>
          <input type="datetime-local" value={form.end_at ?? ""} onChange={(e) => set("end_at", e.target.value || null)} className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Options</label>
          {form.options.map((o, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={o} onChange={(e) => set("options", form.options.map((x, j) => j === i ? e.target.value : x))} className={inputCls} />
              {form.options.length > 2 && <button onClick={() => set("options", form.options.filter((_, j) => j !== i))} className="px-3 rounded-lg glass hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
            </div>
          ))}
          <button onClick={() => set("options", [...form.options, ""])} className="mt-1 text-sm text-cyan inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add option</button>
        </div>
        <button disabled={saving} onClick={save} className="rounded-lg bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          Save changes
        </button>
      </div>
    </div>
  );
}

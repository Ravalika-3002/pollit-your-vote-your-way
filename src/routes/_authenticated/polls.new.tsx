import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createPoll, type CreatePollInput } from "@/lib/poll-service";

export const Route = createFileRoute("/_authenticated/polls/new")({
  head: () => ({ meta: [{ title: "New poll — PollIt" }, { name: "description", content: "Create a new poll" }] }),
  component: NewPoll,
});

const inputCls = "w-full rounded-lg bg-input border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 transition";

function NewPoll() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState<CreatePollInput>({
    title: "", description: "", poll_type: "single", visibility: "public",
    results_visibility: "always", options: ["", ""], status: "draft",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CreatePollInput>(k: K, v: CreatePollInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(status: "draft" | "open") {
    if (!form.title.trim()) return toast.error("Add a title");
    if (form.options.filter((o) => o.trim()).length < 2) return toast.error("Add at least 2 options");
    setSaving(true);
    try {
      const poll = await createPoll({ ...form, status }, user!.id);
      toast.success(status === "open" ? "Poll published!" : "Draft saved");
      nav({ to: "/polls/$id", params: { id: poll.id } });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Create a poll</h1>
      <p className="text-muted-foreground mb-8">Configure your poll. Save as draft to keep editing, or publish to start collecting votes.</p>

      <div className="glass-strong rounded-2xl p-6 space-y-5">
        <Field label="Title">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="What's your favorite framework?" />
        </Field>
        <Field label="Description (optional)">
          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} className={inputCls} placeholder="Add context for voters" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Type">
            <select value={form.poll_type} onChange={(e) => set("poll_type", e.target.value as never)} className={inputCls}>
              <option value="single">Single choice</option>
              <option value="multiple">Multiple choice</option>
            </select>
          </Field>
          <Field label="Visibility">
            <select value={form.visibility} onChange={(e) => set("visibility", e.target.value as never)} className={inputCls}>
              <option value="public">Public — anyone signed in</option>
              <option value="private">Private — invite only</option>
            </select>
          </Field>
          <Field label="Results">
            <select value={form.results_visibility} onChange={(e) => set("results_visibility", e.target.value as never)} className={inputCls}>
              <option value="always">Always visible</option>
              <option value="after_vote">After voting</option>
            </select>
          </Field>
          <Field label="End date (optional)">
            <input type="datetime-local" value={form.end_at ?? ""} onChange={(e) => set("end_at", e.target.value || null)} className={inputCls} />
          </Field>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Options</label>
          <div className="space-y-2">
            {form.options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input value={o} onChange={(e) => set("options", form.options.map((x, j) => j === i ? e.target.value : x))}
                  className={inputCls} placeholder={`Option ${i + 1}`} />
                {form.options.length > 2 && (
                  <button onClick={() => set("options", form.options.filter((_, j) => j !== i))} className="px-3 rounded-lg glass hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => set("options", [...form.options, ""])} className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add option
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button disabled={saving} onClick={() => submit("draft")} className="rounded-lg glass px-5 py-2.5 font-semibold hover:border-border disabled:opacity-60">
            Save as draft
          </button>
          <button disabled={saving} onClick={() => submit("open")} className="rounded-lg bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60">
            Publish poll
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

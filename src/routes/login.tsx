import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { LogoBrand, logoBrandClass } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — PollIt" }, { name: "description", content: "Sign in to PollIt" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell>
      <motion.form
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        onSubmit={onSubmit} className="glass-strong rounded-2xl p-8 w-full max-w-md ring-glow"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your PollIt account</p>
        </div>
        <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
        <Field label="Password"><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></Field>
        <button disabled={loading} className="mt-2 w-full rounded-lg bg-gradient-brand px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-5 text-sm text-center text-muted-foreground">
          No account? <Link to="/signup" className="text-cyan hover:underline">Create one</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

export const inputCls = "w-full rounded-lg bg-input border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 transition";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 md:px-12 py-4 md:py-6">
        <Link to="/" className="inline-block shrink-0">
          <LogoBrand className={logoBrandClass} />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-8">{children}</div>
    </div>
  );
}

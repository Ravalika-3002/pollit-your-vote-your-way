import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AuthShell, Field, inputCls } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — PollIt" }, { name: "description", content: "Create your PollIt account" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: name || email.split("@")[0] },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("signups are disabled")) {
        return toast.error(
          "Email sign-up is turned off in Supabase. Enable it under Authentication → Providers → Email.",
          { duration: 8000 },
        );
      }
      return toast.error(error.message);
    }
    if (!data.session) {
      toast.success("Account created! Check your email to confirm, then sign in.");
      navigate({ to: "/login" });
      return;
    }
    toast.success("Account created! You're in.");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell>
      <motion.form
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        onSubmit={onSubmit} className="glass-strong rounded-2xl p-8 w-full max-w-md ring-glow"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start polling in 30 seconds</p>
        </div>
        <Field label="Display name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" /></Field>
        <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
        <Field label="Password"><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></Field>
        <button disabled={loading} className="mt-2 w-full rounded-lg bg-gradient-brand px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="mt-5 text-sm text-center text-muted-foreground">
          Have an account? <Link to="/login" className="text-cyan hover:underline">Sign in</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

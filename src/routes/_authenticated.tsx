import { createFileRoute, Outlet, redirect, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Compass, Home, Inbox, LogOut, Menu, Plus, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LogoBrand, LogoMark, logoNavClass } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AuthedLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/feed", label: "Public Feed", icon: Compass },
  { to: "/my-polls", label: "My Polls", icon: BarChart3 },
  { to: "/shared", label: "Shared with me", icon: Inbox },
];

function AuthedLayout() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col p-5 border-r border-border bg-background/50 backdrop-blur-md">
        <Link to="/dashboard"><LogoBrand className={`${logoNavClass} mb-8`} /></Link>
        <Link
          to="/polls/new"
          className="mb-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.02] transition"
        >
          <Plus className="h-4 w-4" /> New poll
        </Link>
        <nav className="space-y-1">
          {nav.map((n) => {
            const active = loc.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-gradient-soft text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
              >
                <n.icon className={`h-4 w-4 ${active ? "text-cyan" : ""}`} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto glass rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center font-semibold text-primary-foreground text-sm">
              {(user?.email ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.user_metadata?.display_name ?? user?.email}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <button
              onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-secondary"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between p-4 backdrop-blur-md bg-background/70 border-b border-border">
        <Link to="/dashboard"><LogoBrand className={logoNavClass} /></Link>
        <button onClick={() => setOpen(true)} className="p-2 rounded-md glass"><Menu className="h-5 w-5" /></button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-xl p-6"
          >
            <div className="flex justify-between mb-8"><LogoMark /><button onClick={() => setOpen(false)}><X /></button></div>
            <Link to="/polls/new" className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> New poll</Link>
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-lg px-3 py-3 text-base">
                <n.icon className="h-5 w-5" /> {n.label}
              </Link>
            ))}
            <button onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}
              className="mt-6 flex items-center gap-3 rounded-lg px-3 py-3 text-base text-destructive">
              <LogOut className="h-5 w-5" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-16 md:pt-0">
        <div className="p-5 md:p-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

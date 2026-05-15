import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, Eye, EyeOff, Lock, Globe, Users } from "lucide-react";
import type { Poll } from "@/lib/poll-service";

export function PollCard({ poll, options = 0 }: { poll: Poll; options?: number }) {
  const statusColor = {
    draft: "text-muted-foreground bg-secondary/60",
    open: "text-cyan bg-cyan/10",
    closed: "text-magenta bg-magenta/10",
  }[poll.status];

  return (
    <Link to="/polls/$id" params={{ id: poll.id }}>
      <motion.div
        whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
        className="glass rounded-2xl p-5 h-full hover:border-gradient hover:shadow-[var(--shadow-glow)] transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={`text-xs font-medium uppercase tracking-wide rounded-full px-2.5 py-1 ${statusColor}`}>{poll.status}</span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {poll.visibility === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {poll.results_visibility === "always" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </div>
        </div>
        <h3 className="text-lg font-semibold leading-tight line-clamp-2">{poll.title}</h3>
        {poll.description && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{poll.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" />{options} options</span>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{poll.poll_type}</span>
        </div>
      </motion.div>
    </Link>
  );
}

export function PollGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-soft flex items-center justify-center mb-4">
        <BarChart3 className="h-5 w-5 text-cyan" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

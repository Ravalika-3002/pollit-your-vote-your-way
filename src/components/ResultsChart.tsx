import { motion } from "framer-motion";
import type { PollResults } from "@/lib/poll-service";

export function ResultsChart({ results }: { results: PollResults }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{results.totalRespondents}</span> respondent{results.totalRespondents === 1 ? "" : "s"}
      </div>
      {results.options.map((o, i) => (
        <div key={o.id}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium">{o.label}</span>
            <span className="text-muted-foreground">{o.count} · {o.percentage.toFixed(1)}%</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${o.percentage}%` }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: "easeOut" }}
              className="h-full bg-gradient-brand"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

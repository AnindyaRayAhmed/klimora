import { useState } from "react";
import { ChevronDown, Calculator } from "lucide-react";
import { getScoreBreakdown } from "@/lib/api/adapters";
import type { Locality } from "@/lib/ui-constants";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function ScoreBreakdown({ locality }: { locality: Locality }) {
  const [open, setOpen] = useState(false);
  const { items, base, adjustments, final } = getScoreBreakdown(locality);

  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 md:px-5 py-3 flex items-center justify-between gap-3 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calculator className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider">Climate Score Breakdown</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ConfidenceBadge level="High" />
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 md:px-5 pb-4 pt-1 border-t border-border/40">
          <div className="text-[11px] text-muted-foreground mb-3">
            Starts at <span className="text-foreground font-semibold tabular-nums">{base}</span>. Each driver subtracts points based on local conditions.
          </div>
          <ul className="space-y-1.5">
            {items.map((it) => (
              <li key={it.label} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: `var(--${it.token})` }} />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{it.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{it.detail}</div>
                  </div>
                </div>
                <div
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: it.delta < 0 ? "var(--destructive)" : "var(--success)" }}
                >
                  {it.delta > 0 ? "+" : ""}{it.delta}
                </div>
              </li>
            ))}
            {adjustments !== 0 && (
              <li className="flex items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <div>
                    <div className="font-medium">Other Adjustments</div>
                    <div className="text-[10px] text-muted-foreground">Microclimate &amp; community signals</div>
                  </div>
                </div>
                <div
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: adjustments < 0 ? "var(--destructive)" : "var(--success)" }}
                >
                  {adjustments > 0 ? "+" : ""}{adjustments}
                </div>
              </li>
            )}
          </ul>

          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider">Final Climate Score</span>
            <span className="text-lg font-bold tabular-nums text-primary">{final}<span className="text-xs text-muted-foreground font-normal">/100</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

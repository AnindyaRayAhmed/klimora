import { ShieldCheck, Activity, AlertCircle } from "lucide-react";
import type { ConfidenceLevel } from "@/lib/api/adapters";

const config: Record<ConfidenceLevel, { color: string; icon: typeof ShieldCheck; basis: string }> = {
  High: { color: "var(--success)", icon: ShieldCheck, basis: "Based on historical observations" },
  Medium: { color: "var(--warning)", icon: Activity, basis: "Based on forecast models" },
  Low: { color: "var(--destructive)", icon: AlertCircle, basis: "Insufficient data" },
};

export function ConfidenceBadge({
  level,
  basis,
  className = "",
}: {
  level: ConfidenceLevel;
  basis?: string;
  className?: string;
}) {
  const cfg = config[level];
  const Icon = cfg.icon;
  return (
    <span
      title={basis ?? cfg.basis}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${className}`}
      style={{
        background: `color-mix(in oklab, ${cfg.color} 14%, transparent)`,
        borderColor: `color-mix(in oklab, ${cfg.color} 35%, transparent)`,
        color: cfg.color,
      }}
    >
      <Icon className="h-2.5 w-2.5" />
      Confidence: {level}
    </span>
  );
}

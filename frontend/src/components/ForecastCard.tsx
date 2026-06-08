import { Flame, CloudRain, Wind, Clock } from "lucide-react";
import { getLocalForecast } from "@/lib/api/adapters";
import type { Locality } from "@/lib/ui-constants";
import { ConfidenceBadge } from "./ConfidenceBadge";

const iconMap = { heat: Flame, rainfall: CloudRain, aqi: Wind } as const;

const levelColor: Record<string, string> = {
  Good: "var(--success)",
  Low: "var(--success)",
  Moderate: "var(--warning)",
  High: "var(--climate)",
  Severe: "var(--destructive)",
};

export function ForecastCard({ locality }: { locality: Locality }) {
  const f = getLocalForecast(locality);

  return (
    <div className="glass-strong rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Local Climate Forecast</div>
          <div className="text-sm font-semibold mt-0.5">{f.window} · {locality.name}</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" />
          {f.updated}
        </div>
      </div>

      <div className="space-y-2">
        {f.outlooks.map((o) => {
          const Icon = iconMap[o.token];
          const color = levelColor[o.level];
          return (
            <div key={o.label} className="rounded-xl p-2.5 bg-[color-mix(in_oklab,var(--card)_70%,transparent)] border border-border/50 flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, border: `1px solid color-mix(in oklab, ${color} 30%, transparent)` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold">{o.label}</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
                  >
                    {o.level}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{o.detail}</div>
              </div>
              <ConfidenceBadge level={o.confidence} className="shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

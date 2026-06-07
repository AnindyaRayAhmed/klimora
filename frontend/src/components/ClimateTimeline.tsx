import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from "recharts";
import { climateTimeline } from "@/lib/ui-constants";
import { ConfidenceBadge } from "./ConfidenceBadge";

type Metric = "temp" | "aqi" | "ndvi" | "rain";

const metrics: { id: Metric; label: string; unit: string; color: string }[] = [
  { id: "temp", label: "Temperature", unit: "°C", color: "var(--heat)" },
  { id: "aqi", label: "AQI", unit: "", color: "var(--aqi)" },
  { id: "ndvi", label: "Vegetation", unit: "NDVI", color: "var(--vegetation)" },
  { id: "rain", label: "Rainfall", unit: "mm", color: "var(--rainfall)" },
];

export function ClimateTimeline() {
  const [metric, setMetric] = useState<Metric>("temp");
  const cfg = metrics.find((m) => m.id === metric)!;
  const latest = climateTimeline.at(-1)![metric];
  const first = climateTimeline[0][metric];
  const change = (((latest as number) - (first as number)) / (first as number)) * 100;

  return (
    <div className="glass-strong rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">
            Climate Timeline
            <ConfidenceBadge level="High" basis="Based on 6 years of observed data" />
          </div>
          <div className="text-sm font-semibold mt-0.5">6-Year Environmental Trend</div>
        </div>
        <div className="inline-flex glass rounded-lg p-0.5 gap-0.5 text-[11px]">
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-2 py-1 rounded-md transition-colors ${metric === m.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              style={metric === m.id ? { background: `color-mix(in oklab, ${m.color} 22%, transparent)` } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-2xl font-bold tabular-nums" style={{ color: cfg.color }}>
          {latest}{cfg.unit && cfg.unit !== "NDVI" ? cfg.unit : ""}
        </span>
        <span className={`text-xs font-medium ${change >= 0 ? "text-destructive" : "text-success"}`}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}% since 2019
        </span>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={climateTimeline} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`tl-grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cfg.color} stopOpacity="0.5" />
                <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey={metric} stroke={cfg.color} strokeWidth={2} fill={`url(#tl-grad-${metric})`} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={32} />
            <Tooltip cursor={false} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

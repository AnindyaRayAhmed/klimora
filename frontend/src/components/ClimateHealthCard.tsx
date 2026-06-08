import { TrendingUp, TrendingDown, Minus, Flame, Wind, Trees, CloudRain } from "lucide-react";
import type { Locality } from "@/lib/ui-constants";
import { ConfidenceBadge } from "./ConfidenceBadge";

function scoreColor(score: number) {
  if (score >= 70) return "var(--success)";
  if (score >= 55) return "var(--climate)";
  if (score >= 40) return "var(--warning)";
  return "var(--destructive)";
}

function scoreLabel(score: number) {
  if (score >= 70) return "Healthy";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Stressed";
  return "Critical";
}

function TrendIcon({ trend }: { trend: Locality["trend"] }) {
  if (trend === "improving") return <TrendingUp className="h-3.5 w-3.5 text-success" />;
  if (trend === "declining") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function MiniMetric({
  icon: Icon, label, value, sub, token,
}: { icon: typeof Flame; label: string; value: string; sub: string; token: string }) {
  return (
    <div className="rounded-xl p-2.5 bg-[color-mix(in_oklab,var(--card)_70%,transparent)] border border-border/50">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="h-3 w-3" style={{ color: `var(--${token})` }} />
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums leading-tight">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

export function ClimateHealthCard({ locality }: { locality: Locality }) {
  const color = scoreColor(locality.climateScore);
  const label = scoreLabel(locality.climateScore);
  const circumference = 2 * Math.PI * 52;
  const progress = (locality.climateScore / 100) * circumference;

  return (
    <div className="glass-strong rounded-2xl p-4 md:p-5 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: color }} />

      <div className="flex items-center justify-between mb-3 relative gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Climate Health Score</div>
          <div className="text-sm font-semibold mt-0.5 truncate">{locality.name}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ConfidenceBadge level="High" />
          <div className="flex items-center gap-1 text-[11px] glass rounded-full px-2 py-0.5">
            <TrendIcon trend={locality.trend} />
            <span className="capitalize">{locality.trend}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Score ring */}
        <div className="relative h-[120px] w-[120px] shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" stroke="var(--sidebar-accent)" strokeWidth="8" fill="none" />
            <circle
              cx="60" cy="60" r="52"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              className="animate-score-sweep"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold tabular-nums" style={{ color }}>{locality.climateScore}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mb-1.5"
            style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
            {label}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {locality.scoreDelta > 0 ? "+" : ""}{locality.scoreDelta} pts vs last month.{" "}
            {locality.context.split(".")[0]}.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <MiniMetric
          icon={Flame} label="Heat Risk"
          value={locality.heatRisk.label}
          sub={`${locality.temperature.value}°C · ${locality.temperature.delta > 0 ? "+" : ""}${locality.temperature.delta}°`}
          token="heat"
        />
        <MiniMetric
          icon={Wind} label="Air Quality"
          value={String(locality.airQuality.aqi)}
          sub={locality.airQuality.label}
          token="aqi"
        />
        <MiniMetric
          icon={Trees} label="Vegetation"
          value={locality.vegetation.ndvi.toFixed(2)}
          sub={locality.vegetation.label}
          token="vegetation"
        />
        <MiniMetric
          icon={CloudRain} label="Rainfall"
          value={`${locality.rainfall.mm} mm`}
          sub={`${locality.rainfall.label} · ${locality.rainfall.delta > 0 ? "+" : ""}${locality.rainfall.delta}%`}
          token="rainfall"
        />
      </div>
    </div>
  );
}
